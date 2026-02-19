package com.sufi.approvalhub.service.document;

import org.springframework.stereotype.Component;

@Component
public class StubAiClient implements AiClient {
    @Override
    public String answer(String systemPrompt, String userPrompt) {
        return "I don't know based on the provided document.";
    }
}
