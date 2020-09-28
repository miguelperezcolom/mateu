package io.mateu.showcase.app;

import io.mateu.mdd.core.annotations.*;
import io.mateu.mdd.core.app.MateuApp;
import io.mateu.mdd.shared.annotations.PrivateHome;
import io.mateu.mdd.shared.annotations.PublicHome;
import io.mateu.mdd.shared.annotations.Submenu;

@MateuUI(path = "")
public class SimpleUI extends MateuApp {

    @Submenu
    ConfigMenu config;

    @PublicHome
    String msg = "Hello world";

    @PrivateHome
    String eyesOnlyMsg = "Hello Mateu";

}
