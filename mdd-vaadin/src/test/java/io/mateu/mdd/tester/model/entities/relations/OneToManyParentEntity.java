package io.mateu.mdd.tester.model.entities.relations;

import io.mateu.mdd.core.annotations.*;
import lombok.MateuMDDEntity;

import javax.persistence.*;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@MateuMDDEntity
public class OneToManyParentEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;


    @SearchFilter
    private String stringField = "";






    // enseña un grid y añadimos elementos abriendo el buscador
    @OneToMany(mappedBy = "parent")
    private List<OneToManyChildEntity> children = new ArrayList<>();





    // enseña un link que abre un buscador con el listado, desde el que podemos abrir otro buscador para añadir elementos
    @OneToMany
    @UseLinkToListView(addEnabled = true, deleteEnabled = true)
    private List<OneToManyChildEntity> lazyChildren = new ArrayList<>();





    // crea un checkbox para cada elemento posible
    @OneToMany
    @UseCheckboxes
    @JoinTable(name = "onetomanywithcheckboxes")
    private Set<OneToManyChildEntity> withCheckboxes = new HashSet<>();





    // crea un grid editable inline
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinTable(name = "onetomanyowned")
    private List<OneToManyChildEntity> ownedChildren = new ArrayList<>();




    // crea un grid que, al hacer click, abre un editor que puede navegarse
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OneToManyComplexChildEntity> ownedComplexChildren = new ArrayList<>();





    // crea 2 listas para ir moviendo elementos de un lado a otro
    @OneToMany
    @UseTwinCols
    @JoinTable(name = "onetomanytwincols")
    private Set<OneToManyChildEntity> twinColsChildren = new HashSet<>();



    // crea un checkbox para cada elemento posible
    @OneToMany
    @UseChips
    @JoinTable(name = "onetomanywithchips")
    private Set<OneToManyChildEntity> withChips= new HashSet<>();






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
