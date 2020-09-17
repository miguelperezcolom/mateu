package io.mateu.showcase.app;

import io.mateu.mdd.core.annotations.Action;
import io.mateu.showcase.domain.boundedContexts.common.model.Person;
import io.mateu.showcase.domain.boundedContexts.educational.model.AcademicCourse;
import io.mateu.showcase.domain.boundedContexts.educational.model.Classroom;

public class ConfigMenu {

    @Action
    public Class courses = AcademicCourse.class;

    @Action
    public Class persons = Person.class;

    @Action
    public Class classrooms = Classroom.class;



}
