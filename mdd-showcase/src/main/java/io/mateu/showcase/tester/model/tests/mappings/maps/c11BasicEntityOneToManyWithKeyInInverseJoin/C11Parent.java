package io.mateu.showcase.tester.model.tests.mappings.maps.c11BasicEntityOneToManyWithKeyInInverseJoin;

import lombok.MateuMDDEntity;

import javax.persistence.*;
import java.util.HashMap;
import java.util.Map;

@MateuMDDEntity
public class C11Parent {

    @OneToMany(cascade = CascadeType.PERSIST)
    @JoinTable(name = "c11parent_son",
            joinColumns = {@JoinColumn(name = "parent_id")},
            inverseJoinColumns = {@JoinColumn(name = "son_id"), @JoinColumn(name = "key")}
    )
    @MapKeyJoinColumn(name = "key")
    private Map<String, C11Son> sons = new HashMap<>();

}
