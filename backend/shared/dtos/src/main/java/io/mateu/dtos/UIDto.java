package io.mateu.dtos;

import lombok.Builder;

@Builder
public record UIDto(String favIcon, String title, String homeRoute, UIIncrementDto home) {}
