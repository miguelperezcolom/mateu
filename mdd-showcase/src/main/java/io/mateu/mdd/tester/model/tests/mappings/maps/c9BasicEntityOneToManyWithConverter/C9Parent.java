package io.mateu.mdd.tester.model.tests.mappings.maps.c9BasicEntityOneToManyWithConverter;

import lombok.MateuMDDEntity;

import javax.persistence.*;
import java.util.HashMap;
import java.util.Map;

@MateuMDDEntity
public class C9Parent {

    @Convert(converter = C9Converter.class)
    private Map<String, C9Son> sons = new HashMap<>();

}
