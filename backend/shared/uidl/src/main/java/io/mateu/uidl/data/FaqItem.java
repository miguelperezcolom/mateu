package io.mateu.uidl.data;

import lombok.Builder;

/** One question/answer of a {@link Faq}; {@code open} makes it start expanded. */
@Builder
public record FaqItem(String question, String answer, boolean open) {}
