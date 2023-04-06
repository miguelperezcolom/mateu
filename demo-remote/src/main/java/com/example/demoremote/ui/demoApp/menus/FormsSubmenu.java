package com.example.demoremote.ui.demoApp.menus;

import com.example.demoremote.ui.demoApp.menus.collections.*;
import com.example.demoremote.ui.demoApp.menus.forms.MyReadOnlyPojo;
import com.example.demoremote.ui.demoApp.menus.forms.MyReadOnlyPojoWithCrud;
import com.example.demoremote.ui.demoApp.menus.forms.ReturnsResult;
import com.example.demoremote.ui.demoApp.menus.forms.UrlAndTextForm;
import com.example.demoremote.ui.demoApp.menus.refs.ExternalRefsAndFilesForm;
import io.mateu.mdd.shared.annotations.MenuOption;
import lombok.Data;


public class FormsSubmenu {


    @MenuOption
    private MyReadOnlyPojo readOnlyPojo;

    @MenuOption
    private MyReadOnlyPojoWithCrud readOnlyPojoWithCrud;

    @MenuOption
    private ReturnsResult returnsResult;

    @MenuOption
    private UrlAndTextForm urlAndTextForm;
}
