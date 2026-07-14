package io.mateu.dtos;

import lombok.Builder;

@Builder
public record ChipDto(String label, String color) {}
