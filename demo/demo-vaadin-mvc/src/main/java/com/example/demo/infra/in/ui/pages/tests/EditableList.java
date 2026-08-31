package com.example.demo.infra.in.ui.pages.tests;

import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.MasterDetail;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.interfaces.ActionHandler;
import io.mateu.uidl.interfaces.HttpRequest;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;

record Row(String name, String email) {}

@Slf4j
@Route("/editable-list")
@Style(StyleConstants.CONTAINER)
public class EditableList implements ActionHandler {

    // A master-detail editable list: the table shows an "Edit" button per row that must open the
    // row's detail editor (regression guard for the edit-button-selects-row bug).
    @MasterDetail(minHeightWhenDetailVisible = "16rem")
    List<Row> rows = new ArrayList<>(List.of(
            new Row("Ada Lovelace", "ada@example.com"),
            new Row("Alan Turing", "alan@example.com")));

    @Toolbar
    void test() {
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        log.info("action " + actionId);
        return this;
    }
}
