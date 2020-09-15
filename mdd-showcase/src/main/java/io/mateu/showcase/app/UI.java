package io.mateu.showcase.app;

import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.annotations.MateuMDDUI;
import io.mateu.mdd.core.app.SimpleMDDApplication;
import io.mateu.showcase.domain.boundedContexts.educational.model.Classroom;
import io.mateu.showcase.domain.boundedContexts.common.model.Person;

@MateuMDDUI(path = "")
public class UI extends SimpleMDDApplication {

    @Action
    public Class persons() {
        return Person.class;
    }

    @Action
    public Class classrooms() {
        return Classroom.class;
    }

}
