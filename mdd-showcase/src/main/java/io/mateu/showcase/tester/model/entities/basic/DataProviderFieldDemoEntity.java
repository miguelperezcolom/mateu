package io.mateu.showcase.tester.model.entities.basic;

import com.google.common.collect.Lists;
import com.vaadin.data.provider.ListDataProvider;
import io.mateu.mdd.core.annotations.DataProvider;
import io.mateu.mdd.core.annotations.UseTwinCols;
import io.mateu.mdd.core.annotations.ValueClass;
import io.mateu.mdd.core.model.authentication.User;
import lombok.MateuMDDEntity;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@MateuMDDEntity
public class DataProviderFieldDemoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String name;

    //@DataProvider(dataProvider = MyDataProvider.class)
    private String stringField;

    public com.vaadin.data.provider.DataProvider getStringFieldDataProvider() {
        return new ListDataProvider(Lists.newArrayList("Rojo", "Verde", "Azul", "Amarillo"));
    }

    @DataProvider(dataProvider = MyIntDataProvider.class)
    private int intField;

    @DataProvider(dataProvider = MyDataProvider2.class)
    @ManyToOne
    private BasicFieldsDemoEntity entityField;

    @DataProvider(dataProvider = MyDataProvider2.class)
    @UseTwinCols
    @OneToMany
    private Set<BasicFieldsDemoEntity> collectionField = new HashSet<>();


    @ValueClass(User.class)
    private String currencyCode;

    @ValueClass(BasicFieldsDemoEntity.class)
    private long entityId;


    @ValueClass(User.class)
    private List<String> users = new ArrayList<>();

}
