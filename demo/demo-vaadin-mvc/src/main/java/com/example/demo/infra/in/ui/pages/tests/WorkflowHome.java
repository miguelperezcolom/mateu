package com.example.demo.infra.in.ui.pages.tests;

import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.annotations.HorizontalLayout;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.data.*;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;

import java.util.List;

@UI("/_workflow")
//@KeycloakSecured(url = "https://lemur-11.cloud-iam.com/auth", realm = "mateu", clientId = "demo")
@FavIcon("/images/riu.svg")
@PageTitle("Workflow")
@Logo("/images/riu.svg")
@Title("Workflow Engine")
@Style(StyleConstants.CONTAINER)
public class WorkflowHome {


    io.mateu.uidl.data.HorizontalLayout charts = io.mateu.uidl.data.HorizontalLayout.builder()
            .content(    List.of(
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
                    Chart.builder()
                            .chartType(ChartType.bar)
                            .chartData(ChartData.builder()
                                    .labels(List.of("Pending", "Running", "Completed", "Error", "Cancelled"))
                                    .datasets(List.of(ChartDataset.builder()
                                            .label("Processes")
                                            .data(List.of(1d, 2d, 3d, 4d, 1d))
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
                            .build(),
                    Chart.builder()
                            .chartType(ChartType.doughnut)
                            .chartData(ChartData.builder()
                                    .labels(List.of("Pending", "Completed"))
                                    .datasets(List.of(ChartDataset.builder()
                                            .label("label 1")
                                            .data(List.of(1d, 2d))
                                            .build()))
                                    .build())
                            .chartOptions(ChartOptions.builder()
                                    .maintainAspectRatio(false)
                                    .build())
                            .build()
            ))
            .style("width: 100%;justify-content: space-around; margin-bottom: 2rem;align-items: center;")
            .build();

    io.mateu.uidl.data.HorizontalLayout kpis = io.mateu.uidl.data.HorizontalLayout.builder()
            .content(List.of(
                    Card.builder()
                            .title(Text.builder().text("Process Definitions").build())
                            .content(Text.builder().text("10").style("text-align: center;").build())
                            .style("flex-grow: 1;width: 12rem;")
                            .build(),
                    Card.builder()
                            .title(Text.builder().text("Running Processes").build())
                            .content(Text.builder().text("10").style("text-align: center;").build())
                            .style("flex-grow: 1;width: 12rem;")
                            .build(),
                    Card.builder()
                            .title(Text.builder().text("Completed Processes").build())
                            .content(Text.builder().text("10").style("text-align: center;").build())
                            .style("flex-grow: 1;width: 12rem;")
                            .build(),
                    Card.builder()
                            .title(Text.builder().text("Form Definitions").build())
                            .content(Text.builder().text("10").style("text-align: center;").build())
                            .style("flex-grow: 1;width: 12rem;")
                            .build(),
                    Card.builder()
                            .title(Text.builder().text("User Tasks").build())
                            .content(Text.builder().text("10").style("text-align: center;").build())
                            .style("flex-grow: 1;width: 12rem;")
                            .build()
            ))
            .spacing(true)
            .build();

    @Stereotype(FieldStereotype.html)
    String message = "<p>Welcome to the event driven orchestrator.</p>" +
            "<p>Here you will be able to create workflow definitions and processes.</p>";

    @Menu
    WorkflowMenu workflow;

}
