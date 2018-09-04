package io.mateu.mdd.tester.model.entities.relations;

import io.mateu.mdd.core.annotations.SearchFilter;
import io.mateu.mdd.core.annotations.UseCheckboxes;
import io.mateu.mdd.core.annotations.UseLinkToListView;
import io.mateu.mdd.core.annotations.UseTwinCols;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Getter@Setter
public class OneToManyParentEntity implements Serializable {

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


    @OneToMany
    @UseCheckboxes
    @JoinTable(name = "onetomanywithcheckboxes")
    private Set<OneToManyChildEntity> withCheckboxes = new HashSet<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinTable(name = "onetomanyowned")
    private List<OneToManyChildEntity> ownedChildren = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OneToManyComplexChildEntity> ownedComplexChildren = new ArrayList<>();

    @OneToMany
    @UseTwinCols
    @JoinTable(name = "onetomanytwincols")
    private Set<OneToManyChildEntity> twinColsChildren = new HashSet<>();





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
