package com.example.demo.infra.in.ui.fluent.nestedapps;

import io.mateu.uidl.annotations.Route;

@Route("/nested-apps/left/home")
@Route("/nested-apps/top/home")
@Route("/nested-apps/tabs/home")
public class Home {

    String content = "Hello from home";

}
