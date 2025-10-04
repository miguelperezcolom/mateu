package com.example.demo.infra.in.ui.antonia;

import io.mateu.uidl.annotations.Details;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.VerticalLayout;
import io.mateu.uidl.interfaces.Page;
import io.mateu.uidl.interfaces.SubtitleSupplier;
import io.mateu.uidl.interfaces.TitleSupplier;
import io.mateu.uidl.interfaces.HorizontalLayout;

@Details(summary = "This is the summary")
class Content implements HorizontalLayout {

    String name = "Mateu";

    int age = 17;


}

@Route("/app/page3")
@VerticalLayout
public class Page3 implements TitleSupplier, SubtitleSupplier, Page {

    Content content;


    @Override
    public String title() {
        return "Page 2";
    }

    @Override
    public String subtitle() {
        return "This is a simple subtitle";
    }
}
