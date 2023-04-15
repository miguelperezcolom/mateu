package com.example.demoremote.ui.demoApp.menus.forms;

import io.mateu.mdd.shared.annotations.Action;

public class ReturnsBasic {

    String name;

    int age;

    @Action
    public String sayHello() {
        return "Hello " + name + ", aged " + age;
    }

    @Action
    public int showRating() {
        return 5;
    }

    @Action
    public double showRandom() {
        return Math.random();
    }

}
