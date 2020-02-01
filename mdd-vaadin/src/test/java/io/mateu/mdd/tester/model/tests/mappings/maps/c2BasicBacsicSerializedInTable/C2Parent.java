package io.mateu.mdd.tester.model.tests.mappings.maps.c2BasicBacsicSerializedInTable;

import lombok.MateuMDDEntity;

import javax.persistence.ElementCollection;
import java.util.HashMap;
import java.util.Map;

@MateuMDDEntity
public class C2Parent {

    @ElementCollection
    private Map<String, String> valuesByKey = new HashMap<>();

}
