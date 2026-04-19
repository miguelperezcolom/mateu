package com.example.demo.infra.in.ui.fluent.nestedapps;

import io.mateu.uidl.annotations.Route;

@Route(value="/components/high-level/nested-apps/left/home", parentRoute = "/components/high-level/nested-apps/left")
@Route(value="/components/high-level/nested-apps/left/submenu/home", parentRoute = "/components/high-level/nested-apps/left")
@Route(value="/components/high-level/nested-apps/top/home", parentRoute = "/components/high-level/nested-apps/top")
@Route(value="/components/high-level/nested-apps/tabs/home", parentRoute = "/components/high-level/nested-apps/tabs")
public class SharedHome {

    String content = "Hello from home, shared between all nested apps";

}
