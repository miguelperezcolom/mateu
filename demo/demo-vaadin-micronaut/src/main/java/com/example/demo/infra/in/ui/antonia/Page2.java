package com.example.demo.infra.in.ui.antonia;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.interfaces.Page;
import io.mateu.uidl.interfaces.SubtitleSupplier;
import io.mateu.uidl.interfaces.TitleSupplier;

@Route("/app/page2")
@Route("/fluent-app/page2")
public class Page2 implements TitleSupplier, SubtitleSupplier, Page {

    @Override
    public String title() {
        return "Page 2";
    }

    @Override
    public String subtitle() {
        return "This is a simple subtitle";
    }
}
