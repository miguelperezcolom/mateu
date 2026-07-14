package io.mateu.dtos;

import lombok.Builder;

@Builder
public record FaqItemDto(String question, String answer, boolean open) {}
