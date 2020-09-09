package io.mateu.showcase.tester.model.tests.mappings.maps.c9BasicEntityOneToManyWithConverter;

import lombok.Getter;

import javax.validation.constraints.NotEmpty;

@Getter
public class C9Son {

    @NotEmpty
    private final String name;


    public C9Son(String name) {
        this.name = name;
    }
}
