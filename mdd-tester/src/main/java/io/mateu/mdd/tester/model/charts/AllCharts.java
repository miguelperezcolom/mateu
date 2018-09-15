package io.mateu.mdd.tester.model.charts;

import com.vaadin.data.provider.ListDataProvider;
import io.mateu.mdd.core.CSS;
import io.mateu.mdd.core.annotations.FullWidth;
import io.mateu.mdd.core.annotations.KPIInline;
import io.mateu.mdd.core.annotations.SameLine;
import io.mateu.mdd.core.annotations.Width;
import io.mateu.mdd.core.dataProviders.JPQLListDataProvider;
import io.mateu.mdd.vaadinport.vaadin.components.charts.*;
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


    private BarChart barChart = new BarChart("Bar chart", new RandomDataProvider(3, 12));

    @SameLine
    private PieChart pieChart = new PieChart("Pie chart", new RandomDataProvider(2, 5));

    @FullWidth
    private LineChart lineChart = new LineChart("Line chart", new RandomDataProvider(3, 12));

    //    private BarChart barChartFromJPQL = new BarChart("JPQL bar chart", new JPQLListDataProvider(""));


    public AllCharts() throws Throwable {
    }

}
