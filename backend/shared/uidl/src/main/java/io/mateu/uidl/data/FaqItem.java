package io.mateu.uidl.data;

import lombok.Builder;

/**
 * One question/answer of a {@link Faq}; {@code open} makes it start expanded. The {@code answer} is
 * markdown (rendered sanitized).
 */
@Builder
public record FaqItem(String question, String answer, boolean open) {}
