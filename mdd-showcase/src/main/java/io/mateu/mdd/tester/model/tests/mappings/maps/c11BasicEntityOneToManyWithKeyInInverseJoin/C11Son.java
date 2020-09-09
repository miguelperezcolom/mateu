package io.mateu.mdd.tester.model.tests.mappings.maps.c11BasicEntityOneToManyWithKeyInInverseJoin;

import lombok.MateuMDDEntity;

import javax.validation.constraints.NotEmpty;

@MateuMDDEntity
public class C11Son {

    @NotEmpty
    private final String name;
}
