package io.mateu.mdd.demoadminpanel.infra.in.ui;

import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.FormLayout;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Avatar;
import io.mateu.uidl.data.Badge;
import io.mateu.uidl.data.Chart;
import io.mateu.uidl.data.ChartData;
import io.mateu.uidl.data.ChartDataset;
import io.mateu.uidl.data.ChartOptions;
import io.mateu.uidl.data.ChartType;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.KPI;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;

import java.util.List;

@UI("/mixed")
@Style(StyleConstants.CONTAINER)
@FormLayout(columns = 1)
public class MixedPage {

    String name;

    Component stats = new HorizontalLayout(
            Chart.builder()
                    .chartType(ChartType.doughnut)
                    .chartData(ChartData.builder()
                            .labels(List.of("Scrap", "Create release", "Deploy"))
                            .datasets(List.of(ChartDataset.builder()
                                    .label("label 1")
                                    .data(List.of(1d, 2d, 3d))
                                    .build()))
                            .build())
                    .chartOptions(ChartOptions.builder()
                            .maintainAspectRatio(false)
                            .build())
                    .build(),
            new Avatar("Mateu")
    );

    @Button
    void save() {}

}