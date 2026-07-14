package io.mateu.uidl.data;

import lombok.Builder;

/** One stage of a {@link Funnel}: a label, its numeric value, and an optional bar color. */
@Builder
public record FunnelStage(String label, double value, String color) {}
