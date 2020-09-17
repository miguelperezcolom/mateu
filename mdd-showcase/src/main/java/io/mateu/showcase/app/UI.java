package io.mateu.showcase.app;

import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.annotations.MateuMDDUI;
import io.mateu.mdd.core.app.SimpleMDDApplication;
import io.mateu.showcase.domain.boundedContexts.educational.model.AcademicCourse;
import io.mateu.showcase.domain.boundedContexts.educational.model.Classroom;
import io.mateu.showcase.domain.boundedContexts.common.model.Person;
import io.mateu.showcase.domain.boundedContexts.educational.model.Grade;

@MateuMDDUI(path = "")
public class UI extends SimpleMDDApplication {

    @Action
    public Class courses() {
        return AcademicCourse.class;
    }

    @Action
    public Class persons() {
        return Person.class;
    }

    @Action
    public Class classrooms() {
        return Classroom.class;
    }

    @Action
    public Class grades() {
        return Grade.class;
    }

}
