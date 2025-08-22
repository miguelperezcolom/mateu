package com.example.demo.infra.in.ui.fluent.components;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Chart;
import io.mateu.uidl.data.ChartAxisScale;
import io.mateu.uidl.data.ChartData;
import io.mateu.uidl.data.ChartDataset;
import io.mateu.uidl.data.ChartOptions;
import io.mateu.uidl.data.ChartScales;
import io.mateu.uidl.data.ChartType;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/components/charts")
public class ChartsComponentPage implements ComponentTreeSupplier {
    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Charts")
                .content(List.of(
                    Chart.builder()
                            .chartType(ChartType.line)
                            .chartData(ChartData.builder()
                                    .labels(List.of("uno", "dos", "tres", "cuatro"))
                                    .datasets(List.of(ChartDataset.builder()
                                                    .label("label 1")
                                                    .data(List.of(1d, 2d, 3d, 4d))
                                            .build()))
                                    .build())
                            .chartOptions(ChartOptions.builder()
                                    .maintainAspectRatio(false)
                                    .scales(ChartScales.builder()
                                            .y(ChartAxisScale.builder()
                                                    .beginAtZero(true)
                                                    .build())
                                            .build())
                                    .build())
                            .build()
                ))
                .build();
    }
}
