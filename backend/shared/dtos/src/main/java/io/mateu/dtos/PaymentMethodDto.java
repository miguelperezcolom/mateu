package io.mateu.dtos;

import lombok.Builder;

@Builder
public record PaymentMethodDto(String id, String label) {}
