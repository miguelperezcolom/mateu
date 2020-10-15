package io.mateu.showcase.app;

import io.mateu.mdd.core.annotations.MateuUI;
import io.mateu.mdd.shared.annotations.Area;
import io.mateu.security.Private;
import io.mateu.showcase.app.extended.ExtendedArea;
import org.example.application.ui.ComplexUI;

@MateuUI(path = "/extended")
public class ExtendedUI extends ComplexUI {

    @Area@Private
    ExtendedArea extended;


}
