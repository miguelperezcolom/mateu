package com.example.demo.infra.in.ui.antonia;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.ActionType;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.interfaces.Form;
import io.mateu.uidl.interfaces.HasSubtitle;
import io.mateu.uidl.interfaces.HasTitle;

@Route("/app/page1")
@Route("/fluent-app/page1")
@Route("/fluent-app/nested-app/page1")
@Route("/fluent-app/nested-app/nested-app/page1")
public class Page1 implements HasTitle, HasSubtitle, Form {

    String name;

    int age;

    @Action(type = ActionType.Main)
    public void printHello() {
        System.out.println("Hello " + name + ", " + age + " years old");
    }

    @Action(type = ActionType.Main)
    public String sayHello() {
        return "Hello " + name + ", " + age + " years old";
    }

    @Action(type = ActionType.Main)
    public Page2 showPage2() {
        return new Page2();
    }

    @Action(type = ActionType.Main)
    public RouteLink goToPage2() {
        return new RouteLink("/app/page2");
    }

    @Override
    public String getTitle() {
        return "Page 1";
    }

    @Override
    public String getSubtitle() {
        return "This is a simple subtitle";
    }
}
