package io.mateu.showcase.domain.boundedContexts.educational.model;

import lombok.MateuMDDEntity;

import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import java.util.Set;

@MateuMDDEntity
public class Classroom {

    private String name;

    @ManyToOne
    private Teacher teacher;

    @ManyToMany
    private Set<Student> students;

}
