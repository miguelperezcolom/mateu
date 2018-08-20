package io.mateu.mdd.tester.model.entities.basic;

import com.google.common.collect.Lists;
import com.vaadin.data.provider.AbstractDataProvider;
import com.vaadin.data.provider.ListDataProvider;

import java.util.Collection;

public class MyIntDataProvider extends ListDataProvider {
    public MyIntDataProvider() {
        super(Lists.newArrayList(3, 10, 21, 5));
    }
}
