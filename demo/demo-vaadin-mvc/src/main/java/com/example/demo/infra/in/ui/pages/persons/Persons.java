package com.example.demo.infra.in.ui.pages.persons;

import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.NoFilters;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.HttpRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class Persons extends Crud<
        PersonDetailView,
        PersonEditorView,
        PersonCreationForm,
        NoFilters,
        PersonRow,
        String
        > {

    @Override
    public PersonDetailView view(String id, HttpRequest httpRequest) {
        return new PersonDetailView(id, "Mateu", 17);
    }

    @Override
    public PersonEditorView edit(String id, HttpRequest httpRequest) {
        return new PersonEditorView(id, "Mateu", 17, List.of());
    }

    @Override
    public PersonCreationForm creationForm(HttpRequest httpRequest) {
        return new PersonCreationForm("", 50, List.of());
    }

    @Override
    public void deleteAllById(List<String> selectedIds, HttpRequest httpRequest) {
        log.info("deleting " + selectedIds);
    }

    @Override
    public String save(HttpRequest httpRequest) {
        var editor = httpRequest.getComponentState(PersonEditorView.class);
        editor.save(httpRequest);
        return editor.id();
    }

    @Override
    public String create(HttpRequest httpRequest) {
        return creationForm(httpRequest).create(httpRequest);
    }

    @Override
    public ListingData<PersonRow> search(SearchRequest request, HttpRequest httpRequest) {
        return ListingData.of(List.of(new PersonRow("1", "Mateu", 17)));
    }

}
