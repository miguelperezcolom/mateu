package io.mateu.dtos;

import lombok.Builder;

/** A button */
@Builder
public record BindingDto(BindingSourceDto source, String propertyId) {}
