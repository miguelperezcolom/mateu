package com.example.demo.infra.in.ui.declarative;

import io.mateu.uidl.annotations.Route;

@Route(value="/home", parentRoute="^$")
public class Home {
    
    String content = "Hello from home";

}
