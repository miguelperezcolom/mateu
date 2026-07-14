package io.mateu.dtos;

import lombok.Builder;

@Builder
public record HeatCellDto(String date, double value, String label) {}
