package io.mateu.mdd.tester.model.entities.basic;

import com.google.common.collect.Lists;
import com.vaadin.data.provider.AbstractDataProvider;
import com.vaadin.data.provider.ListDataProvider;

import java.util.Collection;

public class MyDataProvider extends ListDataProvider {
    public MyDataProvider() {
        super(createCollection());
    }

    private static Collection createCollection() {
        return Lists.newArrayList("Rojo", "Verde", "Azul", "Amarillo");
    }
}
