package com.example.demo.infra.in.ui.pages.persons;

import io.mateu.core.infra.declarative.orchestrators.crud.CrudOrchestrator;
import io.mateu.uidl.data.NoFilters;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.CrudAdapter;
import io.mateu.uidl.interfaces.HttpRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class Persons extends CrudOrchestrator<
        PersonDetailView,
        PersonEditorView,
        PersonCreationForm,
        NoFilters,
        PersonRow,
        String
        > {

    final PersonsCrudAdapter adapter;

    @Override
    public CrudAdapter<PersonEditorView, PersonCreationForm, NoFilters, PersonRow, String> adapter() {
        return adapter;
    }

    @Override
    public String toId(String id) {
        return id;
    }

    @Override
    public Class editorClass() {
        return PersonEditorView.class;
    }

    @Override
    public Class creationFormClass() {
        return PersonCreationForm.class;
    }

    @Override
    public Object save(HttpRequest httpRequest) {
        var editor = httpRequest.getComponentState(PersonEditorView.class);
        editor.save(httpRequest);
        return editor.id();
    }

    @Override
    public Object saveNew(HttpRequest httpRequest) {
        return adapter.getCreationForm(httpRequest).create(httpRequest);
    }

    @Override
    public String getIdFieldForRow() {
        return "id";
    }

    @Override
    public Object search(String searchText, Object filters, Pageable pageable, HttpRequest httpRequest) {
        return adapter.search(searchText, (NoFilters) filters, pageable, httpRequest);
    }

}
