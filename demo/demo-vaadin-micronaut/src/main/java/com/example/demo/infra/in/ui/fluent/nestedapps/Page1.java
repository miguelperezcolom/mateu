package com.example.demo.infra.in.ui.fluent.nestedapps;

import io.mateu.uidl.annotations.Route;

@Route(value="/components/high-level/nested-apps/left/page1", parentRoute = "/components/high-level/nested-apps/left")
@Route(value="/components/high-level/nested-apps/left/submenu/page1", parentRoute = "/components/high-level/nested-apps/left")
@Route(value="/components/high-level/nested-apps/top/page1", parentRoute = "/components/high-level/nested-apps/top")
@Route(value="/components/high-level/nested-apps/tabs/page1", parentRoute = "/components/high-level/nested-apps/tabs")
public class Page1 {

    String content = "Hello from page 1";

}
