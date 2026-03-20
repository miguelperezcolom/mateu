package com.example.demo.infra.in.ui.pages.persons;

import io.mateu.uidl.annotations.Colspan;
import io.mateu.uidl.interfaces.CrudEditorForm;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.TitleSupplier;

import java.util.List;

public record PersonEditorView(
        String id,
        String name,
        int age,
        @Colspan(2)
        List<Friend> friends
) implements CrudEditorForm<String>, TitleSupplier {
    @Override
    public void save(HttpRequest httpRequest) {
    }

    @Override
    public String title() {
        return name;
    }
}
