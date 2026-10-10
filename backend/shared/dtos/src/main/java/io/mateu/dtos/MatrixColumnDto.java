package io.mateu.dtos;

import lombok.Builder;

@Builder
public record MatrixColumnDto(String id, String label, String group, String tone) {}
