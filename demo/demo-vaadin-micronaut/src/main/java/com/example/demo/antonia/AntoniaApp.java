package com.example.demo.antonia;

import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.interfaces.App;
import io.mateu.uidl.interfaces.HasPageTitle;
import io.mateu.uidl.interfaces.HasTitle;

@MateuUI("/antonia")
public class AntoniaApp implements HasPageTitle, App {

    @Override
    public String getPageTitle() {
        return "Antonia";
    }


}
