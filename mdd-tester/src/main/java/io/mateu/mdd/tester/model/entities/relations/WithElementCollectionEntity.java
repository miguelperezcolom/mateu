package io.mateu.mdd.tester.model.entities.relations;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter@Setter
public class WithElementCollectionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String name;

    @ElementCollection
    private List<CollectionElement> elements = new ArrayList<>();

}
