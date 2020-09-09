package io.mateu.showcase.tester.model.tests.mappings.maps.c7BasicEntityManyToManyWithJoinTable2;

import lombok.MateuMDDEntity;

import javax.persistence.*;
import java.util.HashMap;
import java.util.Map;

@MateuMDDEntity
public class C7Parent {

    @ManyToMany
    private Map<String, C7Son> sons = new HashMap<>();

}
