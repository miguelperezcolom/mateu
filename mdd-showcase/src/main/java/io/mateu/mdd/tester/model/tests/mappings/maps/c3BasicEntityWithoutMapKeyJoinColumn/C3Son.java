package io.mateu.mdd.tester.model.tests.mappings.maps.c3BasicEntityWithoutMapKeyJoinColumn;

import lombok.MateuMDDEntity;

import javax.persistence.Entity;
import javax.validation.constraints.NotEmpty;

@MateuMDDEntity
public class C3Son {

    @NotEmpty
    private final String name;
}
