package io.mateu.showcase.tester.model.tests.mappings.maps.c6BasicEntityManyToManyWithJoinTable;

import lombok.MateuMDDEntity;

import javax.persistence.*;
import java.util.HashMap;
import java.util.Map;

@MateuMDDEntity
public class C6Parent {

    @ManyToMany
    @JoinTable(name = "c6parent_c6son",
                    joinColumns = {@JoinColumn(name = "parent_id")},
                    inverseJoinColumns = {@JoinColumn(name = "son_id")}
            )
    @MapKeyJoinColumn(name = "key")
    private Map<String, C6Son> sons = new HashMap<>();

}
