package com.example.demo.antonia;

import io.mateu.uidl.annotations.Details;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.VerticalLayout;
import io.mateu.uidl.interfaces.Form;
import io.mateu.uidl.interfaces.HasSubtitle;
import io.mateu.uidl.interfaces.HasTitle;
import io.mateu.uidl.interfaces.HorizontalLayout;
import io.micronaut.serde.annotation.Serdeable;

@Details(summary = "This is the summary")
class Content implements HorizontalLayout {

    String name = "Mateu";

    int age = 17;


}

@Route("/app/page3")
@Serdeable
@VerticalLayout
public class Page3 implements HasTitle, HasSubtitle, Form {

    Content content;


    @Override
    public String getTitle() {
        return "Page 2";
    }

    @Override
    public String getSubtitle() {
        return "This is a simple subtitle";
    }
}
