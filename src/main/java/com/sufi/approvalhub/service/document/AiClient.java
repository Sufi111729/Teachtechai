package com.sufi.approvalhub.service.document;

public interface AiClient {
    String answer(String systemPrompt, String userPrompt);
}
