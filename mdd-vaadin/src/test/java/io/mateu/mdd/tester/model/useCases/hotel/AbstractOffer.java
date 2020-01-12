package io.mateu.mdd.tester.model.useCases.hotel;

import io.mateu.mdd.core.annotations.UseCheckboxes;
import io.mateu.mdd.core.util.DatesRange;
import lombok.MateuMDDEntity;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@MateuMDDEntity
public abstract class AbstractOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;


    @ManyToOne
    private Hotel hotel;


    private String name;


    private List<DatesRange> dates = new ArrayList<>();


    @ManyToMany
    @UseCheckboxes
    private Set<Contract> contracts = new HashSet<>();


    @Override
    public boolean equals(Object obj) {
        return this == obj || id == ((AbstractOffer)obj).getId();
    }


    @Override
    public String toString() {
        return name != null?name:"Offer " + getId();
    }
}
