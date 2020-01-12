package io.mateu.mdd.tester.model.charts;

import io.mateu.mdd.core.CSS;
import io.mateu.mdd.core.annotations.FullWidth;
import io.mateu.mdd.core.annotations.KPIInline;
import io.mateu.mdd.core.annotations.SameLine;
import io.mateu.mdd.vaadinport.vaadin.components.charts.BarChart;
import io.mateu.mdd.vaadinport.vaadin.components.charts.LineChart;
import io.mateu.mdd.vaadinport.vaadin.components.charts.PieChart;
import io.mateu.mdd.vaadinport.vaadin.components.charts.RandomDataProvider;
import lombok.Getter;
import lombok.Setter;

@Getter@Setter
public class AllCharts {


    @KPIInline(style = CSS.SUPERKPI)
    private int bookingsToday = 53;

    @KPIInline(style = CSS.SUPERKPI)
    @SameLine
    private int totalBookings = 300;


    private BarChart barChart = new BarChart(new RandomDataProvider(3, 12));

    @SameLine
    private PieChart pieChart = new PieChart(new RandomDataProvider(2, 5));

    @FullWidth
    private LineChart lineChart = new LineChart(new RandomDataProvider(3, 12));

    //private BarChart barChartFromJPQL = new BarChart("JPQL bar chart", new JPQLListDataProvider(""));


    public AllCharts() throws Throwable {
    }

}
