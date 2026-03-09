package com.example.demo.infra.in.ui.pages.persons;

import io.mateu.core.infra.declarative.CrudOrchestrator;
import io.mateu.uidl.data.NoFilters;
import io.mateu.uidl.interfaces.CrudAdapter;
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
    public CrudAdapter<PersonDetailView, PersonEditorView, PersonCreationForm, NoFilters, PersonRow, String> adapter() {
        return adapter;
    }

    @Override
    public String toId(String id) {
        return id;
    }

}
