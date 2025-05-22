package com.example.demo.antonia;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.interfaces.Form;
import io.mateu.uidl.interfaces.HasSubtitle;
import io.mateu.uidl.interfaces.HasTitle;

@Route("/page1")
public class Page1 implements HasTitle, HasSubtitle, Form {

    @Override
    public String getTitle() {
        return "Page 1";
    }

    @Override
    public String getSubtitle() {
        return "This is a simple subtitle";
    }
}
