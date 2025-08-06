package io.mateu.uidl.data;

import lombok.Builder;

@Builder
public record ChartOptions(boolean maintainAspectRatio, ChartScales scales) {}
