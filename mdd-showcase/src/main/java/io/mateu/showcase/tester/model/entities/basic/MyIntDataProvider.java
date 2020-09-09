package io.mateu.showcase.tester.model.entities.basic;

import com.google.common.collect.Lists;
import com.vaadin.data.provider.ListDataProvider;

public class MyIntDataProvider extends ListDataProvider {
    public MyIntDataProvider() {
        super(Lists.newArrayList(3, 10, 21, 5));
    }
}
