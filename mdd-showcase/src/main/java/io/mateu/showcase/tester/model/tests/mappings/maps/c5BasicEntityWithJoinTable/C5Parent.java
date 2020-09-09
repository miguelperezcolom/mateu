package io.mateu.showcase.tester.model.tests.mappings.maps.c5BasicEntityWithJoinTable;

import lombok.MateuMDDEntity;

import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.MapKeyJoinColumn;
import javax.persistence.OneToMany;
import java.util.HashMap;
import java.util.Map;

@MateuMDDEntity
public class C5Parent {

    @OneToMany
    @JoinTable(name = "c5parent_c5son",
                    joinColumns = {@JoinColumn(name = "parent_id")},
                    inverseJoinColumns = {@JoinColumn(name = "son_id")}
            )
    @MapKeyJoinColumn(name = "key")
    private Map<String, C5Son> sons = new HashMap<>();

}
