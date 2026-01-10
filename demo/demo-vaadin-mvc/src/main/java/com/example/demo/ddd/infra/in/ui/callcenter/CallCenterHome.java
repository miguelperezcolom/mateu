package com.example.demo.ddd.infra.in.ui.callcenter;

import io.mateu.uidl.annotations.FavIcon;
import io.mateu.uidl.annotations.Logo;
import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.PageTitle;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Title;

@MateuUI("/call-center")
@Style("width: 100%;")
@Title("Call center")
@FavIcon("/images/favicon.png")
@PageTitle("Call center")
@Logo("/images/logo.png")
public class CallCenterHome {

    @Menu
    CallCenterSubmenu callCenter;

    String content = "Hola!";

}
