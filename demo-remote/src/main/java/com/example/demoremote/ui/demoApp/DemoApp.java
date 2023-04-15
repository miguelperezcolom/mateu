package com.example.demoremote.ui.demoApp;

import com.example.demoremote.ui.demoApp.menus.*;
import com.example.demoremote.ui.demoApp.menus.forms.BasicFieldsForm;
import io.mateu.mdd.core.interfaces.HasAppTitle;
import io.mateu.mdd.core.interfaces.HasLogin;
import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.interfaces.IncludesRemoteUIs;
import io.mateu.mdd.shared.interfaces.RemoteJourney;
import io.mateu.mdd.shared.interfaces.RemoteSubmenu;
import io.mateu.mdd.shared.interfaces.RemoteUI;
import lombok.Getter;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Caption("")
@MateuUI("")
@ExternalScripts("https://ajax.googleapis.com/ajax/libs/model-viewer/3.0.1/model-viewer.min.js")
@Getter
public class DemoApp implements HasLogin, HasAppTitle
        //, IncludesRemoteUIs
        {

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

    /*
    @Submenu
    private RemoteSubmenu remote = new RemoteSubmenu("https://demo.mateu.io/mateu/v1", "com.example.demo.DemoApp", "Simple menu");

    @Override
    public List<RemoteUI> getRemoteUIs() {
        return List.of(new RemoteUI("https://demo.mateu.io/mateu/v1", "com.example.demo.DemoApp"));
    }

    */

    @Override
    public String getLoginUrl() {
        return "/login";
    }

    @RawContent
    String someContent = """
            
            <h1>Hello!</h1>
            
            <p>This is some content for the home page.</p>
            
            """;


            @Override
            public String getAppTitle() {
                return "Demo app";
            }
        }
