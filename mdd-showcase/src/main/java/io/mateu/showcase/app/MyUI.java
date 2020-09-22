package io.mateu.showcase.app;

import io.mateu.mdd.core.annotations.*;
import io.mateu.mdd.core.app.MateuUI;
import org.example.domain.boundaries.common.entities.Person;

@MateuMDDUI(path = "")
public class MyUI extends MateuUI {

    @Private
    @Submenu
    public ConfigMenu config;

    @Action
    public Class persons = Person.class;

    @Home
    public String msg = "Hello world";

    @PrivateHome
    public String eyesOnlyMsg = "Hello Mateu";

}
