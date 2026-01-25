package com.example.demo.ddd.infra.in.ui.controlplane;

import com.example.demo.ddd.infra.in.ui.controlplane.pages.RecreateDatabaseForm;
import com.example.demo.ddd.infra.in.ui.controlplane.pages.Users;
import io.mateu.uidl.annotations.FavIcon;
import io.mateu.uidl.annotations.Logo;
import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.PageTitle;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Title;

@MateuUI("/control-plane")
@Style("width: 100%;")
@Title("Control Plane")
@FavIcon("/images/favicon.png")
@PageTitle("Control Plane")
@Logo("/images/logo.png")
public class ControlPlaneHome {

    @Menu
    Users users;

    @Menu
    RecreateDatabaseForm recreateDatabase;

    String content = "Hola!";

}
