package io.mateu.showcase.domain.boundedContexts.educational.model;

import io.mateu.showcase.domain.boundedContexts.common.model.Person;
import lombok.MateuMDDEntity;

import javax.persistence.OneToMany;
import java.util.Set;

@MateuMDDEntity
public class Teacher extends Person {

    @OneToMany(mappedBy = "teacher")
    private Set<Classroom> classes;

}
