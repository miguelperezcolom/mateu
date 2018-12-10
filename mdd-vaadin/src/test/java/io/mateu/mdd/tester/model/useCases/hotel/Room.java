package io.mateu.mdd.tester.model.useCases.hotel;

import com.google.common.collect.Lists;
import com.vaadin.data.provider.ListDataProvider;
import com.vaadin.server.SerializablePredicate;
import io.mateu.mdd.core.annotations.DataProvider;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Getter
@Setter
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;


    @ManyToOne
    private Hotel hotel;

    private String name;

    private String color;

    public com.vaadin.data.provider.DataProvider getColorDataProvider() {
        return new ListDataProvider<String>(Lists.newArrayList("blanco", "negro"));
    }

    private int maxPax;

    private boolean active = true;

    private int order;

    @Override
    public String toString() {
        return name != null?name:"Room " + id;
    }
}
