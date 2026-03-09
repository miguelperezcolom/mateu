package com.example.demo.infra.in.ui.pages.persons;

import io.mateu.uidl.interfaces.TitleSupplier;

public record PersonDetailView(
        String id,
        String name,
        int age
) implements TitleSupplier {
    @Override
    public String title() {
        return name;
    }
}
