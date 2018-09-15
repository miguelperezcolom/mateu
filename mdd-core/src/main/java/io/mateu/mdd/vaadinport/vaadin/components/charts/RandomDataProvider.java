package io.mateu.mdd.vaadinport.vaadin.components.charts;

import com.vaadin.data.provider.ListDataProvider;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Random;

public class RandomDataProvider extends ListDataProvider<ChartData> {

    public RandomDataProvider(int lanes, int columns) {
        super(createRandomData(lanes, columns));
    }


    private static Collection<ChartData> createRandomData(int maxI, int maxJ) {
        Collection<ChartData> l = new ArrayList<>();

        Random rand = new Random(100);

        for (int i = 0; i < maxI; i++) {

            for (int j = 0; j < maxJ; j++) {

                ((ArrayList<ChartData>) l).add(new ChartData("" + i, "" + j, Math.abs(100d * rand.nextDouble())));

            }

        }

        return l;
    }

}
