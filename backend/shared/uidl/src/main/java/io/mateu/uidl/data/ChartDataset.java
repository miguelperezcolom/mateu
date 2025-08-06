package io.mateu.uidl.data;

import java.util.List;
import lombok.Builder;

@Builder
public record ChartDataset(String label, List<Double> data) {}
