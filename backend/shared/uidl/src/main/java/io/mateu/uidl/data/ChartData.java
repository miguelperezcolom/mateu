package io.mateu.uidl.data;

import java.util.List;
import lombok.Builder;

@Builder
public record ChartData(List<String> labels, List<ChartDataset> datasets) {}
