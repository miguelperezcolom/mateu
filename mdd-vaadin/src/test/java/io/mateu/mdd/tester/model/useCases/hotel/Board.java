package io.mateu.mdd.tester.model.useCases.hotel;

import com.google.common.collect.Lists;
import com.vaadin.data.provider.ListDataProvider;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Getter
@Setter
public class Board {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;


    @ManyToOne@NotNull
    private Hotel hotel;

    private String name;


    @Override
    public String toString() {
        return name != null?name:"Board " + id;
    }

}
