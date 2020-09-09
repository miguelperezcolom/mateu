package io.mateu.showcase.tester.model.tests.mappings.maps.c3BasicEntityWithoutMapKeyJoinColumn;

import lombok.MateuMDDEntity;

import javax.persistence.OneToMany;
import java.util.HashMap;
import java.util.Map;

@MateuMDDEntity
public class C3Parent {

    @OneToMany
    private Map<String, C3Son> sons = new HashMap<>();

}
