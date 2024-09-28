package com.example.demo.infra.ui.menus.layouts.shared;

import lombok.Getter;

@Getter
public class RightSideContent {

    String title = "Right side";

    String content = "Hola!";

    public RightSideContent() {
    }

    public RightSideContent(String title, String content) {
        this.title = title;
        this.content = content;
    }
}
