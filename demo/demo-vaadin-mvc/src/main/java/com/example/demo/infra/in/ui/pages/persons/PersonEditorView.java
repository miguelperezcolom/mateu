package com.example.demo.infra.in.ui.pages.persons;

import io.mateu.uidl.annotations.Colspan;
import io.mateu.uidl.annotations.MasterDetail;
import io.mateu.uidl.interfaces.CrudEditorForm;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.TitleSupplier;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record PersonEditorView(
        String id,
        @NotEmpty
        String name,
        int age,
        @Colspan(2)
        @MasterDetail(minHeightWhenDetailVisible = "16rem")
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
