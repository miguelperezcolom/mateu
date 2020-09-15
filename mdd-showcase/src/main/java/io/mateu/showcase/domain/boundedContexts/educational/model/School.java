package io.mateu.showcase.domain.boundedContexts.educational.model;

import lombok.MateuMDDEntity;

import javax.persistence.OneToMany;
import java.util.Set;

@MateuMDDEntity
public class School {

    private String name;

    @OneToMany
    private Set<Classroom> classrooms;

}
