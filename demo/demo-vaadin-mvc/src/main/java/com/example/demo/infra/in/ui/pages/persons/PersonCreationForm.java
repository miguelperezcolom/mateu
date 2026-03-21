package com.example.demo.infra.in.ui.pages.persons;

import io.mateu.uidl.annotations.Colspan;
import io.mateu.uidl.annotations.MasterDetail;
import io.mateu.uidl.interfaces.CrudCreationForm;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.TitleSupplier;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record PersonCreationForm(
        @NotEmpty
        String name,
        int age,
        @Colspan(2)
        @MasterDetail(minHeightWhenDetailVisible = "16rem")
        List<Friend> friends
) implements CrudCreationForm<String>, TitleSupplier {
    @Override
    public String create(HttpRequest httpRequest) {
        return "1";
    }

    @Override
    public String title() {
        return "New Person";
    }
}
