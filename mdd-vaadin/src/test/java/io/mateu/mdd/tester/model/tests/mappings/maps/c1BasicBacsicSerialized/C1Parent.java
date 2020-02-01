package io.mateu.mdd.tester.model.tests.mappings.maps.c1BasicBacsicSerialized;

import lombok.MateuMDDEntity;

import javax.persistence.Entity;
import java.util.HashMap;
import java.util.Map;

@MateuMDDEntity
public class C1Parent {

    private Map<String, String> valuesByKey = new HashMap<>();

}
