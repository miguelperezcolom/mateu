package com.example.demo.infra.in.ui.declarative;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Message;

@Route("/page3")
public class Page3 {
    
    String name = "Mateu";

    int age = 17;

    @Button
    Object sayHello() {
        return new Message("Hello " + name + ", age is " + age);
    }



}
