package io.mateu.showcase.domain.boundedContexts.educational.model;

import io.mateu.showcase.domain.boundedContexts.common.model.Person;
import lombok.MateuMDDEntity;

import javax.persistence.CascadeType;
import javax.persistence.OneToMany;
import java.util.List;

@MateuMDDEntity
public class Student extends Person {

    @OneToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE, CascadeType.REFRESH})
    private List<Grade> grades;

}
