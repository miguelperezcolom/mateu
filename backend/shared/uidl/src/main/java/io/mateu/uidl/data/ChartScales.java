package io.mateu.uidl.data;

import lombok.Builder;

@Builder
public record ChartScales(ChartAxisScale y, ChartAxisScale z) {}
