package io.mateu.dtos;

import lombok.Builder;

@Builder
public record FactDto(String label, String value) {}
