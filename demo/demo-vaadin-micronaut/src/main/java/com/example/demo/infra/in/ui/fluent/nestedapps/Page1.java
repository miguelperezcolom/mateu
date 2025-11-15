package com.example.demo.infra.in.ui.fluent.nestedapps;

import io.mateu.uidl.annotations.Route;

@Route("/nested-apps/left/page1")
@Route("/nested-apps/top/page1")
@Route("/nested-apps/tabs/page1")
public class Page1 {

    String content = "Hello from page 1";

}
