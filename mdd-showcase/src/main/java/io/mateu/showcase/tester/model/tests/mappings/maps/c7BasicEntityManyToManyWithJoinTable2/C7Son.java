package io.mateu.showcase.tester.model.tests.mappings.maps.c7BasicEntityManyToManyWithJoinTable2;

import lombok.MateuMDDEntity;

import javax.validation.constraints.NotEmpty;

@MateuMDDEntity
public class C7Son {

    @NotEmpty
    private final String name;
}
