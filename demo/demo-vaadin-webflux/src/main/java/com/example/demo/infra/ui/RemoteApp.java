package com.example.demo.infra.ui;

import com.example.demo.infra.ui.menus.CrudsSubmenu;
import io.mateu.uidl.annotations.*;

record AnotherForm(String name, int age) {

    @MainAction(target = ActionTarget.Message)
    public String sayHello() {
        return "Hello " + name + ", you are " + age;
    }

}

@MateuUI("/remoteapp")
public class RemoteApp {

    @MenuOption
    SimpleForm simpleForm;

    @MenuOption
    AnotherForm anotherForm = new AnotherForm("Mateu", 16);

    @Submenu
    CrudsSubmenu cruds;

}
