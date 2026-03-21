package com.example.demo.infra.in.ui.pages.persons;

import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.NoFilters;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.CrudAdapter;
import io.mateu.uidl.interfaces.HttpRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class PersonsCrudAdapter implements CrudAdapter<PersonDetailView, PersonEditorView, PersonCreationForm, NoFilters, PersonRow, String> {
    @Override
    public ListingData<PersonRow> search(String searchText, NoFilters noFilters, Pageable pageable) {
        return ListingData.of(List.of(new PersonRow("1", "Mateu", 17)));
    }

    @Override
    public void deleteAllById(List<String> selectedIds) {
        log.info("deleting " + selectedIds);
    }

    @Override
    public PersonDetailView getView(String id) {
        return new PersonDetailView(id, "Mateu", 17);
    }

    @Override
    public PersonEditorView getEditor(String id) {
        return new PersonEditorView(id, "Mateu", 17, List.of());
    }

    @Override
    public PersonCreationForm getCreationForm(HttpRequest httpRequest) {
        return new PersonCreationForm("", 50, List.of());
    }
}
