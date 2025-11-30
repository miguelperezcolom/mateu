package com.example.demo.infra.in.ui.declarative;

import io.mateu.uidl.annotations.Route;

@Route(value="/page1", parentRoute="^$")
public class Page1 {

    String content = "Hello from page 1";

}
