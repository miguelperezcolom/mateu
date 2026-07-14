package io.mateu.uidl.data;

import lombok.Builder;

/**
 * One selectable payment method of a {@link PaymentPicker}: its {@code id} (sent as {@code
 * "_method"} on confirm) and the segmented-button {@code label}.
 */
@Builder
public record PaymentMethod(String id, String label) {}
