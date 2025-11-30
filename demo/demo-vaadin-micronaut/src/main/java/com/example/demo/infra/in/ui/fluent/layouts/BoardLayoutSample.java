package com.example.demo.infra.in.ui.fluent.layouts;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.BoardLayout;
import io.mateu.uidl.data.BoardLayoutItem;
import io.mateu.uidl.data.BoardLayoutRow;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route(value="/layouts/board", parentRoute="^$")
public class BoardLayoutSample implements ComponentTreeSupplier {
    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Board Layout")
                .content(List.of(BoardLayout.builder()
                                .rows(List.of(
                                        BoardLayoutRow.builder()
                                                .content(List.of(
                                                        buildPanel(),
                                                        buildPanel(),
                                                        buildPanel()
                                                ))
                                                .build(),
                                        BoardLayoutRow.builder()
                                                .content(List.of(
                                                                new BoardLayoutItem(buildPanel(), 1),
                                                        new BoardLayoutItem(buildPanel(), 2)
                                                ))
                                                .build()
                                ))
                        .style("width: 40rem;")
                        .build()))
                .build();
    }

    public static Component buildPanel() {
        return buildPanel("");
    }

    public static Component buildPanel(String style) {
        return Text.builder()
                .text("Panel")
                .style("background-color: #d7f0b2;" +
                        "color: darkgreen;" +
                        "border: 1px solid darkgreen;" +
                        "display: flex;" +
                        "align-items: center;" +
                        "justify-content: center;" +
                        "height: 3rem;" +
                        "margin-block-start: 0;" +
                        "margin-block-end: 0;" +
                        style)
                .build();
    }

}
