package io.mateu.showcase.tester.model.tests.mappings.maps.c6BasicEntityManyToManyWithJoinTable;

import lombok.MateuMDDEntity;

import javax.validation.constraints.NotEmpty;

@MateuMDDEntity
public class C6Son {

    @NotEmpty
    private final String name;
}
