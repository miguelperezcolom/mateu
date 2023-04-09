package com.example.demoremote.ui.demoApp;

import com.example.demoremote.ui.demoApp.menus.*;
import com.example.demoremote.ui.demoApp.menus.forms.BasicFieldsForm;
import io.mateu.mdd.core.interfaces.HasLogin;
import io.mateu.mdd.shared.annotations.Caption;
import io.mateu.mdd.shared.annotations.ExternalScripts;
import io.mateu.mdd.shared.annotations.MateuUI;
import io.mateu.mdd.shared.annotations.MenuOption;
import io.mateu.mdd.shared.annotations.Private;
import io.mateu.mdd.shared.annotations.Submenu;
import io.mateu.mdd.shared.interfaces.RemoteJourney;
import org.springframework.stereotype.Component;

@Component
@Caption("This is a demo")
@MateuUI("")
@ExternalScripts("https://ajax.googleapis.com/ajax/libs/model-viewer/3.0.1/model-viewer.min.js")
public class DemoApp implements HasLogin {

    @MenuOption
    private BasicFieldsForm basicFields;

    @Submenu
    private FormsSubmenu forms;

    @Submenu
    private CollectionsSubmenu collections;

    @Submenu
    private RefsSubmenu refs;

    @Submenu("Some cruds")
    private CrudsSubmenu cruds;

    @Submenu("NFL")
    private NFLSubmenu nfl;

    @Submenu("Star Wars")
    private SWSubmenu sw;

    @MenuOption
    @Private
    private BasicFieldsForm eyesOnly;

    @Override
    public String getLoginUrl() {
        return "/login";
    }
}
