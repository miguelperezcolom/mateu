package com.example.demo.infra.ui.menus.layouts.shared.crud;

import io.mateu.uidl.annotations.Sortable;

public record Row(
        String id,
        @Sortable(serverSide = true)
        String name,
        int age) {
}
