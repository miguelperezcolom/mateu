package io.mateu.mdd.tester.model.entities.basic;

import com.vaadin.data.provider.AbstractDataProvider;
import io.mateu.mdd.core.dataProviders.JPQLListDataProvider;

import javax.persistence.Query;

public class MyDataProvider2 extends JPQLListDataProvider {

    public MyDataProvider2() throws Throwable {
        super("select x from " + BasicFieldsDemoEntity.class.getName() + " x where lower(x.stringField) like '%a%'");
    }
}
