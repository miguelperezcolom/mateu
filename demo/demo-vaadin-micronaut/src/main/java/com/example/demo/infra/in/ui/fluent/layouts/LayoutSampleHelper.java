package com.example.demo.infra.in.ui.fluent.layouts;

import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;

public class LayoutSampleHelper {

    public static Component buildPanel() {
        return buildPanel("");
    }

    public static Component buildPanel(String style) {
        return Text.builder()
                .text("Panel")
                .style("background-color: #d7f0b2;" +
                        "color: darkgreen;" +
                        "border: 1px solid darkgreen;" +
                        "min-width: 7rem;" +
                        "max-width: 7rem;" +
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
