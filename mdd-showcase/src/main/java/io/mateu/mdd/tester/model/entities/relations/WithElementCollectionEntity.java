package io.mateu.mdd.tester.model.entities.relations;

import javax.persistence.ElementCollection;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import lombok.MateuMDDEntity;
import javax.persistence.Id;
import java.util.ArrayList;
import java.util.List;

@MateuMDDEntity
public class WithElementCollectionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String name;

    @ElementCollection
    private List<CollectionElement> elements = new ArrayList<>();

}
