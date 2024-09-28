package com.example.demo.infra.ui.menus.layouts.shared;

import lombok.Getter;

@Getter
public class LeftSideContent {

    String title = "Left side";

    String content = "Hola!";

    public LeftSideContent() {
    }

    public LeftSideContent(String title, String content) {
        this.title = title;
        this.content = content;
    }
}
