package io.mateu.dtos;

import lombok.Builder;

@Builder
public record LedgerLineDto(
    String concept, Double amount, boolean included, String includedLabel) {}
