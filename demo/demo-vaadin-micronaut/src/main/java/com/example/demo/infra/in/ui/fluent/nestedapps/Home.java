package com.example.demo.infra.in.ui.fluent.nestedapps;

import io.mateu.uidl.annotations.Route;

@Route(value = "/nested-apps/left/home", parentRoute = "/nested-apps/left")
@Route(value = "/nested-apps/top/home", parentRoute = "/nested-apps/top")
@Route(value = "/nested-apps/tabs/home", parentRoute = "/nested-apps/tabs")
public class Home {

    String content = "Hello from home";

}
