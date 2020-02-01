package io.mateu.mdd.tester.model.tests.mappings.maps.c10BasicEntityTransient;

import com.fasterxml.jackson.annotation.JsonFilter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.MateuMDDEntity;

import javax.persistence.CascadeType;
import javax.persistence.ManyToOne;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

@MateuMDDEntity
public class C10Row {

    @ManyToOne@NotNull@JsonIgnore
    private final C10Parent parent;

    @NotEmpty
    private final String key;

    @ManyToOne(cascade = CascadeType.PERSIST)@NotNull
    private final C10Son value;

}
