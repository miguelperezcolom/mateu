package io.mateu.mdd.vaadinport.vaadin.components.charts;

import com.byteowls.vaadin.chartjs.ChartJs;
import com.byteowls.vaadin.chartjs.config.PieChartConfig;
import com.byteowls.vaadin.chartjs.data.PieDataset;
import com.byteowls.vaadin.chartjs.options.InteractionMode;
import com.byteowls.vaadin.chartjs.options.types.PieChartOptions;
import com.google.common.base.Strings;
import com.vaadin.data.provider.ListDataProvider;
import com.vaadin.data.provider.Query;
import com.vaadin.ui.Composite;

import java.util.*;
import java.util.stream.Collectors;

public class PieChart extends Composite {

    private static String[] colores = {"red", "blue", "green", "orange", "darkgrey", "cyan", "yellow", "brown"};
    private static Random randBGColor = new Random();

    private final String title;
    private ListDataProvider<ChartData> dataProvider;

    public PieChart(ListDataProvider<ChartData> dataProvider) {
        this(null, dataProvider);
    }

    public PieChart(String title, ListDataProvider<ChartData> dataProvider) {
        this.title = title;
        this.dataProvider = dataProvider;

        setCompositionRoot(new ChartJs(createConfig(title, dataProvider)));

        setWidth("100%");

        /*
        ChartJs chart = new ChartJs(barConfig);
        chart.setJsLoggingEnabled(true);
        chart.addClickListener((a,b) -> DemoUtils.notification(a, b, barConfig.data().getDatasets().get(a)));
        chart.addLegendClickListener((dataSetIndex,visible, visibleDatasets) -> DemoUtils.legendNotification(dataSetIndex, visible, visibleDatasets));
         */
    }


    private PieChartConfig createConfig(String title, ListDataProvider<ChartData> dataProvider) {

        Map<Object, Map<Object, Double>> data = new HashMap<>();
        List<Object> keys = new ArrayList<>();
        List<Object> labels = new ArrayList<>();

        Map<Object, PieDataset> dataSets = new HashMap<>();


        dataProvider.fetch(new Query<>()).forEach(r -> {
            Map<Object, Double> l = data.get(r.getLine());
            if (l == null) {
                data.put(r.getLine(), l = new HashMap<>());
            }
            l.put(r.getLabel(), r.getValue());

            if (!keys.contains(r.getLine())) keys.add(r.getLine());
            if (!labels.contains(r.getLabel())) labels.add(r.getLabel());
        });


        PieChartConfig barConfig = new PieChartConfig();
        barConfig.
                data()
                .labelsAsList(labels.stream().map(l -> "" + l).collect(Collectors.toList()));
        keys.forEach(k -> {
            dataSets.computeIfAbsent(k, l -> {
                PieDataset ds = new PieDataset();
                ds.label("" + l);
                ds.backgroundColor(colores);
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

        PieChartOptions options = barConfig.
                options();


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

        options.done();

        for (Object k : keys) {
            PieDataset lds = dataSets.get(k);

            List<Double> dl = new ArrayList<>();
            for (Object l : labels) {
                dl.add(data.get(k).getOrDefault(l, 0d));
            }
            lds.dataAsList(dl);
            //lds.randomBackgroundColors(true);
        }

        return barConfig;
    }

    private String randomBGColor() {
        return colores[randBGColor.nextInt(colores.length)];
    }


}
