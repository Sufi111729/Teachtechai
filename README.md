<<<<<<< HEAD
# ApprovalHub

Admin/Teacher/Student approval system with Teacher Document AI (PDF/DOCX extraction + chunked search).

## Tech Stack

Backend:
- Java 17, Spring Boot 3.x
- Spring Security + JWT
- Spring Data JPA + MySQL
- Validation, Swagger/OpenAPI
- Apache PDFBox + Apache POI

Frontend:
- React + Vite + TypeScript
- TailwindCSS
- React Router, React Query
- Axios, Zustand

## Default Admin

- Email: `admin@local.com`
- Password: `Admin@12345`

## Swagger

- URL: `http://localhost:8080/swagger-ui.html`

## MySQL Setup

Create database:
```sql
CREATE DATABASE approvalhub;
```

## FULLTEXT (Optional)

If you want FAST search for document chunks:
```sql
ALTER TABLE teacher_document_chunks ADD FULLTEXT INDEX ft_chunk_text (chunk_text);
```

Set in `src/main/resources/application.properties`:
```
app.search.fulltext-enabled=true
```

If you do not enable FULLTEXT, set it to `false` to use LIKE fallback.

## Local Run (No Docker)

1. Update `src/main/resources/application.properties` with your MySQL credentials.
2. Run backend:
```bash
./mvnw spring-boot:run
```
3. Run frontend:
```bash
cd frontend
npm install
npm run dev
```

## Docker Run

1. Build backend jar:
```bash
./mvnw clean package
```
2. Copy `.env.example` to `.env` and update values.
3. Start containers:
```bash
docker-compose up --build
```

Backend runs on `http://localhost:8080`.
Frontend runs on `http://localhost:5173`.

## Teacher Document AI

- Upload PDF/DOCX via `/api/teacher/documents/upload`
- System extracts text, normalizes it, chunks it, and stores in MySQL.
- Ask questions via `/api/teacher/documents/{documentId}/ask`
- AI stub returns a safe answer. Replace `StubAiClient` with real API integration.

## Postman Collection

Import `postman_collection.json` in Postman.
=======
# Teachtechai
This is ai which one is taking traning with teacher this is all unique ai which one is train by teachers..........................................
>>>>>>> d74376b13604329debf376d7ea76157520e62c66
