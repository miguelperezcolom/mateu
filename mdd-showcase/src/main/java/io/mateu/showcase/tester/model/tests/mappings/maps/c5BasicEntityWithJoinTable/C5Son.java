package io.mateu.showcase.tester.model.tests.mappings.maps.c5BasicEntityWithJoinTable;

import lombok.MateuMDDEntity;

import javax.validation.constraints.NotEmpty;

@MateuMDDEntity
public class C5Son {

    @NotEmpty
    private final String name;
}
