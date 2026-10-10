package io.mateu.dtos;

import lombok.Builder;

@Builder
public record MatrixCellDto(String value, String tone, boolean link) {}
