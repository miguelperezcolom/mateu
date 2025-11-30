package com.example.demo.infra.in.ui.declarative;

import io.mateu.uidl.annotations.Route;

@Route(value="/page2", parentRoute="^$")
public class Page2 {
    
    String content = "Hello from page 2";

}
