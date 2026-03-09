package com.example.demo.infra.in.ui.declarative;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;

@UI("/simpleform")
public class SimpleForm {

    String name;

    int age;

    @Button
    Object sayHello() {
        return new Message("Hello " + name + ". You are " + age + " years old.");
    }

}
