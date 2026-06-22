package io.mateu.sample1;

import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.FormLayout;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.*;
import io.mateu.uidl.fluent.Component;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@UI("/mixed")
@Style(StyleConstants.CONTAINER)
@FormLayout(columns = 1)
@Getter
@Setter
public class MixedPage {

    String name;

    Component stats = new HorizontalLayout(
            Chart.builder()
                    .chartType(ChartType.doughnut)
                    .chartData(ChartData.builder()
                            .labels(List.of("Scrap", "Create release", "Deploy"))
                            .datasets(List.of(ChartDataset.builder()
                                    .label("Effort")
                                    .data(List.of(1d, 2d, 3d))
                                    .build()))
                            .build())
                    .chartOptions(ChartOptions.builder()
                            .maintainAspectRatio(false)
                            .build())
                    .build(),
            Avatar.builder()
                    .name("Mateu")
                    .build()
    );

    @Button
    void save() {}

}
