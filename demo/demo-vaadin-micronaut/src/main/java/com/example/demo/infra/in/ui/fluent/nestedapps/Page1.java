package com.example.demo.infra.in.ui.fluent.nestedapps;

import io.mateu.uidl.annotations.Route;

@Route(value = "/nested-apps/left/page1", parentRoute = "/nested-apps/left")
@Route(value = "/nested-apps/top/page1", parentRoute = "/nested-apps/top")
@Route(value = "/nested-apps/tabs/page1", parentRoute = "/nested-apps/tabs")
public class Page1 {

    String content = "Hello from page 1";

}
