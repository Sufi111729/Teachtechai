package com.sufi.approvalhub.service.document;

import com.sufi.approvalhub.exception.BadRequestException;
import net.sourceforge.tess4j.ITesseract;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.Locale;

@Component
public class DocumentTextExtractor {

    private static final Logger log = LoggerFactory.getLogger(DocumentTextExtractor.class);
    private final String tesseractPath;
    private final String tessdataPath;

    public DocumentTextExtractor(@Value("${app.ocr.tesseract-path:}") String tesseractPath,
                                 @Value("${app.ocr.tessdata-path:}") String tessdataPath) {
        this.tesseractPath = tesseractPath == null ? "" : tesseractPath.trim();
        this.tessdataPath = tessdataPath == null ? "" : tessdataPath.trim();
    }

    public String extractText(MultipartFile file) {
        String contentType = file.getContentType();
        String filename = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase();
        try {
            if (isPdf(contentType, filename)) {
                String extracted = extractPdf(file);
                log.debug("PDF text length: {}", extracted == null ? 0 : extracted.length());
                if (isReadable(extracted)) {
                    return extracted;
                }
                return ocrPdf(file);
            }
            if (isDocx(contentType, filename)) {
                return extractDocx(file);
            }
            if (isImage(contentType, filename)) {
                return ocrImage(file);
            }
        } catch (IOException ex) {
            log.warn("Document read failed: {}", ex.getMessage());
            throw new BadRequestException("Unable to read document");
        } catch (TesseractException ex) {
            log.warn("OCR failed: {}", ex.getMessage());
            throw new BadRequestException("OCR failed to read document");
        }
        throw new BadRequestException("Unsupported file type. Only PDF, DOCX, or image files are allowed.");
    }

    private boolean isPdf(String contentType, String filename) {
        return "application/pdf".equalsIgnoreCase(contentType) || filename.endsWith(".pdf");
    }

    private boolean isDocx(String contentType, String filename) {
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document".equalsIgnoreCase(contentType)
                || filename.endsWith(".docx");
    }

    private boolean isImage(String contentType, String filename) {
        if (contentType == null) {
            contentType = "";
        }
        String ct = contentType.toLowerCase(Locale.ROOT);
        return ct.startsWith("image/") || filename.endsWith(".png") || filename.endsWith(".jpg") || filename.endsWith(".jpeg");
    }

    private String extractPdf(MultipartFile file) throws IOException {
        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    private String extractDocx(MultipartFile file) throws IOException {
        try (XWPFDocument doc = new XWPFDocument(file.getInputStream());
             XWPFWordExtractor extractor = new XWPFWordExtractor(doc)) {
            return extractor.getText();
        }
    }

    private String ocrPdf(MultipartFile file) throws IOException, TesseractException {
        ITesseract tesseract = buildTesseract();
        StringBuilder text = new StringBuilder();
        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            PDFRenderer renderer = new PDFRenderer(document);
            int pages = document.getNumberOfPages();
            for (int i = 0; i < pages; i++) {
                BufferedImage image = renderer.renderImageWithDPI(i, 300);
                text.append(tesseract.doOCR(image)).append("\n");
            }
        }
        log.debug("OCR PDF text length: {}", text.length());
        return text.toString();
    }

    private String ocrImage(MultipartFile file) throws IOException, TesseractException {
        ITesseract tesseract = buildTesseract();
        BufferedImage image = ImageIO.read(file.getInputStream());
        if (image == null) {
            throw new BadRequestException("Unsupported image format");
        }
        return tesseract.doOCR(image);
    }

    private ITesseract buildTesseract() {
        String path = resolveTesseractPath();
        if (path.isEmpty()) {
            throw new BadRequestException("OCR engine not configured");
        }
        Tesseract tesseract = new Tesseract();
        File exeOrDir = new File(path);
        if (exeOrDir.isFile()) {
            tesseract.setTesseractPath(exeOrDir.getParentFile().getAbsolutePath());
        } else {
            tesseract.setTesseractPath(exeOrDir.getAbsolutePath());
        }
        String datapath = resolveTessdataPath(exeOrDir);
        if (!datapath.isEmpty()) {
            tesseract.setDatapath(datapath);
        }
        tesseract.setLanguage("eng");
        return tesseract;
    }

    private String resolveTesseractPath() {
        if (!tesseractPath.isEmpty()) {
            return tesseractPath;
        }
        String env = System.getenv("TESSERACT_PATH");
        return env == null ? "" : env.trim();
    }

    private String resolveTessdataPath(File exeOrDir) {
        if (!tessdataPath.isEmpty()) {
            return tessdataPath;
        }
        String env = System.getenv("TESSDATA_PREFIX");
        if (env != null && !env.trim().isEmpty()) {
            return env.trim();
        }
        File guessed = exeOrDir.isFile()
                ? new File(exeOrDir.getParentFile(), "tessdata")
                : new File(exeOrDir, "tessdata");
        return guessed.exists() ? guessed.getAbsolutePath() : "";
    }

    private boolean isReadable(String text) {
        return text != null && text.trim().length() >= 10;
    }
}
