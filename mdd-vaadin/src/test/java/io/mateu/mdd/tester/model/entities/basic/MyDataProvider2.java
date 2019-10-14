package io.mateu.mdd.tester.model.entities.basic;

import io.mateu.mdd.core.dataProviders.JPQLListDataProvider;

public class MyDataProvider2 extends JPQLListDataProvider {

    public MyDataProvider2() throws Throwable {
        super("select x from " + BasicFieldsDemoEntity.class.getName() + " x where lower(x.stringField) like '%a%'");
    }
}
