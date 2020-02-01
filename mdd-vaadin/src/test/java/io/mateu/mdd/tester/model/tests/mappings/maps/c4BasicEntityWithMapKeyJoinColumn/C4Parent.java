package io.mateu.mdd.tester.model.tests.mappings.maps.c4BasicEntityWithMapKeyJoinColumn;

import lombok.MateuMDDEntity;

import javax.persistence.MapKeyJoinColumn;
import javax.persistence.OneToMany;
import java.util.HashMap;
import java.util.Map;

@MateuMDDEntity
public class C4Parent {

    @OneToMany
    @MapKeyJoinColumn(name = "key")
    private Map<String, C4Son> sons = new HashMap<>();

}
