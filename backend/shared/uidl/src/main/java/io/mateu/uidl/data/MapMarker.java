package io.mateu.uidl.data;

import lombok.Builder;

/**
 * A point on a {@link Map}: where it is, its name ({@code label}, shown on hover and next to the
 * pin), an optional {@code description} line and pin {@code color} (any CSS colour).
 */
@Builder
public record MapMarker(
    String id, double latitude, double longitude, String label, String description, String color) {}
