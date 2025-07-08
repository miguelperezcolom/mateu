package com.example.demo.infra.in.ui.fluent.layouts;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.BoardLayout;
import io.mateu.uidl.data.BoardLayoutRow;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/layouts/board")
public class BoardLayoutSample implements ComponentTreeSupplier {
    @Override
    public Form getComponent(HttpRequest httpRequest) {
        return Form.builder()
                .title("Board Layout")
                .content(List.of(BoardLayout.builder()
                                .rows(List.of(
                                        BoardLayoutRow.builder()
                                                .content(List.of(
                                                        new Text("Text 1"),
                                                        new Text("Text 2"),
                                                        new Text("Text 3")
                                                ))
                                                .build(),
                                        BoardLayoutRow.builder()
                                                .content(List.of(
                                                        new Text("Text 4"),
                                                        new Text("Text 5")
                                                ))
                                                .build()
                                ))
                        .build()))
                .build();
    }
}
