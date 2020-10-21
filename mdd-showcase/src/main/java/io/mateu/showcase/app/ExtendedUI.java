package io.mateu.showcase.app;

import io.mateu.mdd.core.annotations.MateuUI;
import io.mateu.mdd.shared.annotations.Area;
import io.mateu.mdd.shared.annotations.MenuOption;
import io.mateu.security.Private;
import io.mateu.showcase.app.extended.ExtendedArea;
import io.mateu.showcase.app.extended.Formulario;
import org.example.application.ui.ComplexUI;

@MateuUI(path = "/extended")
public class ExtendedUI extends ComplexUI {

    @Area@Private
    ExtendedArea extended;




}
