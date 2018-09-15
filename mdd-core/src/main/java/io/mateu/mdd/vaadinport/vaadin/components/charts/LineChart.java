package io.mateu.mdd.vaadinport.vaadin.components.charts;

import com.byteowls.vaadin.chartjs.ChartJs;
import com.byteowls.vaadin.chartjs.config.BarChartConfig;
import com.byteowls.vaadin.chartjs.config.LineChartConfig;
import com.byteowls.vaadin.chartjs.data.BarDataset;
import com.byteowls.vaadin.chartjs.data.LineDataset;
import com.byteowls.vaadin.chartjs.options.InteractionMode;
import com.byteowls.vaadin.chartjs.options.Position;
import com.byteowls.vaadin.chartjs.options.scale.Axis;
import com.byteowls.vaadin.chartjs.options.scale.LinearScale;
import com.byteowls.vaadin.chartjs.options.types.LineChartOptions;
import com.google.common.base.Strings;
import com.vaadin.data.provider.ListDataProvider;
import com.vaadin.data.provider.Query;
import com.vaadin.ui.Composite;

import java.util.*;
import java.util.stream.Collectors;

public class LineChart extends Composite {

    private static String[] colores = {"red", "blue", "green", "orange", "darkgrey"};

    private final String title;
    private ListDataProvider<ChartData> dataProvider;

    public LineChart(ListDataProvider<ChartData> dataProvider) {
        this(null, dataProvider);
    }

    public LineChart(String title, ListDataProvider<ChartData> dataProvider) {
        this.title = title;
        this.dataProvider = dataProvider;

        ChartJs chart;
        setCompositionRoot(chart = new ChartJs(createConfig(title, dataProvider)));

        setWidth("100%");

        /*
        ChartJs chart = new ChartJs(barConfig);
        chart.setJsLoggingEnabled(true);
        chart.addClickListener((a,b) -> DemoUtils.notification(a, b, barConfig.data().getDatasets().get(a)));
        chart.addLegendClickListener((dataSetIndex,visible, visibleDatasets) -> DemoUtils.legendNotification(dataSetIndex, visible, visibleDatasets));
         */
    }


    private LineChartConfig createConfig(String title, ListDataProvider<ChartData> dataProvider) {

        Map<Object, Map<Object, Double>> data = new HashMap<>();
        List<Object> keys = new ArrayList<>();
        List<Object> labels = new ArrayList<>();

        Map<Object, LineDataset> dataSets = new HashMap<>();


        dataProvider.fetch(new Query<>()).forEach(r -> {
            Map<Object, Double> l = data.get(r.getLine());
            if (l == null) {
                data.put(r.getLine(), l = new HashMap<>());
            }
            l.put(r.getLabel(), r.getValue());

            if (!keys.contains(r.getLine())) keys.add(r.getLine());
            if (!labels.contains(r.getLabel())) labels.add(r.getLabel());
        });


        LineChartConfig barConfig = new LineChartConfig();

        barConfig
                .data()
                .labelsAsList(labels.stream().map(l -> "" + l).collect(Collectors.toList()));

        keys.forEach(k -> {
            dataSets.computeIfAbsent(k, l -> {
                LineDataset ds = new LineDataset();
                ds.label("" + l);
                ds.backgroundColor(colores[keys.indexOf(k) % colores.length]);
                ds.fill(false);
                barConfig.data().addDataset(ds);
                return ds;
            });
        });

        /*
                .addDataset(
                        new BarDataset().backgroundColor("rgba(220,220,220,0.5)").label("Dataset 1").yAxisID("y-axis-1"))
                .addDataset(
                        new BarDataset().backgroundColor("rgba(151,187,205,0.5)").label("Dataset 2").yAxisID("y-axis-2").hidden(true))
                .addDataset(
                        new BarDataset().backgroundColor(
                                ColorUtils.randomColor(0.7), ColorUtils.randomColor(0.7), ColorUtils.randomColor(0.7),
                                ColorUtils.randomColor(0.7), ColorUtils.randomColor(0.7), ColorUtils.randomColor(0.7),
                                ColorUtils.randomColor(0.7)).label("Dataset 3").yAxisID("y-axis-1"))
                .and();
                */

        LineChartOptions options = barConfig
                .options();


        options.responsive(true)
                .hover()
                .mode(InteractionMode.INDEX)
                .intersect(true)
                .animationDuration(400)
                .and();

        if (!Strings.isNullOrEmpty(title)) options.title()
                .display(true)
                .text(title)
                .and();

        options.scales()
                .add(Axis.Y, new LinearScale().display(true).position(Position.LEFT)) //.id("y-axis-1"))
                .and()
                .done();

        for (Object k : keys) {
            LineDataset lds = dataSets.get(k);

            List<Double> dl = new ArrayList<>();
            for (Object l : labels) {
                dl.add(data.get(k).getOrDefault(l, 0d));
            }
            lds.dataAsList(dl);
        }

        return barConfig;
    }



}
