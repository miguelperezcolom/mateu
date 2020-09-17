package io.mateu.showcase.app;

import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.annotations.MateuMDDUI;
import io.mateu.mdd.core.annotations.Submenu;
import io.mateu.mdd.core.app.MateuUI;
import io.mateu.showcase.domain.boundedContexts.educational.model.Grade;

@MateuMDDUI(path = "")
public class MyUI extends MateuUI {

    @Submenu
    public ConfigMenu config;

    @Action
    public Class grades = Grade.class;

}
