package io.mateu.mdd.tester.model.entities.basic;

import io.mateu.mdd.core.annotations.SearchFilter;
import io.mateu.mdd.core.annotations.UseLinkToListView;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Getter@Setter
public class OneToManyParentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;


    @SearchFilter
    private String stringField = "";

    @OneToMany(mappedBy = "parent")
    private List<OneToManyChildEntity> children = new ArrayList<>();

    @OneToMany
    @UseLinkToListView
    private List<OneToManyChildEntity> lazyChildren = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL)
    @JoinTable(name = "onetomanyowned")
    private List<OneToManyChildEntity> ownedChildren = new ArrayList<>();





    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public boolean equals(Object obj) {
        return this == obj || (obj != null && obj instanceof OneToManyParentEntity && id == ((OneToManyParentEntity)obj).id);
    }

    @Override
    public String toString() {
        return stringField;
    }
}
