package com.example.demo.infra.in.ui.pages.tests;

import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.ActionSupplier;
import io.mateu.uidl.interfaces.ActionHandler;
import io.mateu.uidl.interfaces.HttpRequest;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

record Row(String name, String email) {}

@Slf4j
@Route("/editable-list")
public class EditableList implements ActionHandler {

    List<Row> rows = new ArrayList<>();

    @Toolbar
    void test() {

    }


    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {

        log.info("action " + actionId);

        return this;
    }
}
