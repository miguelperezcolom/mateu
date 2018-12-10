package io.mateu.mdd.tester.model.useCases.hotel;


import io.mateu.mdd.core.annotations.UseLinkToListView;
import io.mateu.mdd.core.data.FareValue;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
public class Contract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;


    @ManyToOne
    private Hotel hotel;

    private String name;

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
