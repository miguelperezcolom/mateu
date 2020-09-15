package io.mateu.showcase.domain.boundedContexts.common.model;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import lombok.MateuMDDEntity;

@MateuMDDEntity
@JsonIdentityInfo(generator = ObjectIdGenerators.StringIdGenerator.class, property = "@id")
public class Person {

    private String name;

}
