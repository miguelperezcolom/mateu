package io.mateu.showcase.population;

import io.mateu.mdd.util.JPAHelper;
import io.mateu.showcase.domain.boundedContexts.educational.model.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter@Setter
public class Holder {

    List<AcademicCourse> courses;

    List<Quarter> quarters;

    List<Teacher> teachers;

    List<Student> students;

    List<Classroom> classrooms;

    List<Grade> grades;

    public void persistAll() throws Throwable {
        JPAHelper.transact(em -> {
            if (courses != null) courses.stream().forEach(c -> em.persist(c));
            if (quarters != null) quarters.stream().forEach(c -> em.persist(c));
            if (teachers != null) teachers.stream().forEach(c -> em.persist(c));
            if (students != null) students.stream().forEach(c -> em.persist(c));
            if (classrooms != null) classrooms.stream().forEach(c -> em.persist(c));
            if (grades != null) grades.stream().forEach(c -> em.persist(c));
        });
    }

}
