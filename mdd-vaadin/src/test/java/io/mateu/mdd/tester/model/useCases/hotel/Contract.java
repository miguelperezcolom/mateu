package io.mateu.mdd.tester.model.useCases.hotel;


import io.mateu.mdd.core.annotations.UseCheckboxes;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
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

    @ManyToMany(mappedBy = "contracts")
    @UseCheckboxes
    private Set<Offer> offers = new HashSet<>();


    @Override
    public boolean equals(Object obj) {
        return this == obj || id == ((Contract)obj).getId();
    }

}
