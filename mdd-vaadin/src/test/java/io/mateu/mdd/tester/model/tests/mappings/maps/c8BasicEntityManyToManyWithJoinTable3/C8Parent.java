package io.mateu.mdd.tester.model.tests.mappings.maps.c8BasicEntityManyToManyWithJoinTable3;

import lombok.MateuMDDEntity;

import javax.persistence.*;
import java.util.HashMap;
import java.util.Map;

import static javax.persistence.TemporalType.DATE;

@MateuMDDEntity
public class C8Parent {

    @ElementCollection
    private Map<String, C8Son> sons = new HashMap<>();

}
