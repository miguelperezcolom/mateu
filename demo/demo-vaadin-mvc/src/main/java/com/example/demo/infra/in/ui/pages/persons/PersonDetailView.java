package com.example.demo.infra.in.ui.pages.persons;

import io.mateu.uidl.interfaces.TitleSupplier;
import jakarta.validation.constraints.NotEmpty;

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
