package io.mateu.showcase.app;

import io.mateu.mdd.core.annotations.*;
import io.mateu.mdd.core.app.MateuApp;

@MateuUI(path = "")
public class SimpleUI extends MateuApp {

    @Private
    @Submenu
    ConfigMenu config;

    @PublicHome
    String msg = "Hello world";

    @PrivateHome
    String eyesOnlyMsg = "Hello Mateu";

}
