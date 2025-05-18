package com.example.demo.antonia;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.interfaces.Form;
import io.mateu.uidl.interfaces.HandlesActions;
import io.mateu.uidl.interfaces.HasSubtitle;
import io.mateu.uidl.interfaces.HasTitle;
import io.mateu.uidl.interfaces.HttpRequest;
import io.micronaut.serde.annotation.Serdeable;
import reactor.core.publisher.Mono;

@Route("/page1")
@Serdeable
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
