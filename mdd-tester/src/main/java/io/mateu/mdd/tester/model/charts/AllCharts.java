package io.mateu.mdd.tester.model.charts;

import com.vaadin.data.provider.ListDataProvider;
import io.mateu.mdd.core.CSS;
import io.mateu.mdd.core.annotations.FullWidth;
import io.mateu.mdd.core.annotations.KPIInline;
import io.mateu.mdd.core.annotations.SameLine;
import io.mateu.mdd.core.annotations.Width;
import io.mateu.mdd.core.dataProviders.JPQLListDataProvider;
import io.mateu.mdd.vaadinport.vaadin.components.charts.BarChart;
import io.mateu.mdd.vaadinport.vaadin.components.charts.ChartData;
import io.mateu.mdd.vaadinport.vaadin.components.charts.LineChart;
import io.mateu.mdd.vaadinport.vaadin.components.charts.PieChart;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Random;

@Getter@Setter
public class AllCharts {


    @KPIInline(style = CSS.SUPERKPI)
    private int bookingsToday = 53;

    @KPIInline(style = CSS.SUPERKPI)
    @SameLine
    private int totalBookings = 300;


    private BarChart barChart = new BarChart("Bar chart", createRandomData(3, 12));

    @SameLine
    private PieChart pieChart = new PieChart("Pie chart", createRandomData(2, 5));

    @FullWidth
    private LineChart lineChart = new LineChart("Line chart", createRandomData(3, 12));

    //    private BarChart barChartFromJPQL = new BarChart("JPQL bar chart", new JPQLListDataProvider(""));


    public AllCharts() throws Throwable {
    }




    private ListDataProvider<ChartData> createRandomData(int maxI, int maxJ) {
        Collection<ChartData> l = new ArrayList<>();

        Random rand = new Random(100);

        for (int i = 0; i < maxI; i++) {

            for (int j = 0; j < maxJ; j++) {

                ((ArrayList<ChartData>) l).add(new ChartData("" + i, "" + j, Math.abs(100d * rand.nextDouble())));

            }

        }

        return new ListDataProvider<>(l);
    }


}
