package io.mateu.showcase.tester.model.tests.mappings.maps.c10BasicEntityTransient;

import lombok.MateuMDDEntity;

import javax.validation.constraints.NotEmpty;
import java.io.Serializable;

@MateuMDDEntity
public class C10Son {

    @NotEmpty
    private final String name;
}
