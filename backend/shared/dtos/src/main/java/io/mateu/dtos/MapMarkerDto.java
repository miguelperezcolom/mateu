package io.mateu.dtos;

import lombok.Builder;

/** A point on a {@link MapDto}. */
@Builder
public record MapMarkerDto(
    String id, double latitude, double longitude, String label, String description, String color) {}
