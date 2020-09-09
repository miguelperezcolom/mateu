package io.mateu.mdd.tester.model.useCases.hotel;


import io.mateu.mdd.core.annotations.UseLinkToListView;
import io.mateu.mdd.core.data.FareValue;
import io.mateu.mdd.core.util.DatesRange;
import lombok.MateuMDDEntity;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@MateuMDDEntity
public class Contract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;


    @ManyToOne
    private Hotel hotel;

    private String name;



    List<DatesRange> dates = new ArrayList<>();


    private FareValue markup;

    @ManyToMany(mappedBy = "contracts")
    //@UseCheckboxes(editableInline = true)
    @UseLinkToListView(addEnabled = true, deleteEnabled = true)
    private Set<AbstractOffer> offers = new HashSet<>();

    @Override
    public boolean equals(Object obj) {
        return this == obj || id == ((Contract)obj).getId();
    }

    @Override
    public String toString() {
        return name != null?name:"Contract " + getId();
    }

}
