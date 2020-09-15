package io.mateu.showcase.domain.boundedContexts.educational.model;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import lombok.MateuMDDEntity;

import javax.persistence.OneToMany;
import java.util.Set;

@MateuMDDEntity
@JsonIdentityInfo(generator = ObjectIdGenerators.StringIdGenerator.class, property = "@id")
public class AcademicCourse {

    private String name;

    @OneToMany(mappedBy = "course")
    private Set<Quarter> quarters;

}
