package io.mateu.uidl.data;

import lombok.Builder;

@Builder
public record Validation(String condition, String fieldId, String message) {}
