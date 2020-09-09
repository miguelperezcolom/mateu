package io.mateu.mdd.tester.model.tests.mappings.maps.c8BasicEntityManyToManyWithJoinTable3;

import lombok.MateuMDDEntity;

import javax.validation.constraints.NotEmpty;
import java.io.Serializable;

@MateuMDDEntity
public class C8Son implements Serializable {

    @NotEmpty
    private final String name;
}
