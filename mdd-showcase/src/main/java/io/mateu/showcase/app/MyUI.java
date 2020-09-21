package io.mateu.showcase.app;

import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.annotations.MateuMDDUI;
import io.mateu.mdd.core.app.MateuUI;
import org.example.domain.boundaries.common.entities.Person;

@MateuMDDUI(path = "")
public class MyUI extends MateuUI {

    @Action
    ConfigMenu config;

    @Action
    Class persons = Person.class;

}
