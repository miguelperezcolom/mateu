package io.mateu.showcase.tester.model.tests.mappings.maps.c4BasicEntityWithMapKeyJoinColumn;

import lombok.MateuMDDEntity;

import javax.persistence.Entity;
import javax.validation.constraints.NotEmpty;

@MateuMDDEntity
public class C4Son {

    @NotEmpty
    private final String name;
}
