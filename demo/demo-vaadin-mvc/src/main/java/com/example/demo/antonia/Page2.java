package com.example.demo.antonia;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.interfaces.Form;
import io.mateu.uidl.interfaces.HasSubtitle;
import io.mateu.uidl.interfaces.HasTitle;

@Route("/page2")
public class Page2 implements HasTitle, HasSubtitle, Form {

    @Override
    public String getTitle() {
        return "Page 2";
    }

    @Override
    public String getSubtitle() {
        return "This is a simple subtitle";
    }
}
