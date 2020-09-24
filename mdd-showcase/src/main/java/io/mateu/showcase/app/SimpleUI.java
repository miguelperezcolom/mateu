package io.mateu.showcase.app;

import io.mateu.mdd.core.annotations.*;
import io.mateu.mdd.core.app.MateuUI;
import org.example.domain.boundaries.common.entities.Person;

@MateuMDDUI(path = "")
public class SimpleUI extends MateuUI {

    @Private
    @Submenu
    ConfigMenu config;

    @PublicHome
    String msg = "Hello world";

    @PrivateHome
    String eyesOnlyMsg = "Hello Mateu";

}
