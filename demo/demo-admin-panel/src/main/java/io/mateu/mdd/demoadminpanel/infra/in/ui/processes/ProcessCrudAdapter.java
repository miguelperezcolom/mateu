package io.mateu.mdd.demoadminpanel.infra.in.ui.processes;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrudAdapter;
import io.mateu.uidl.interfaces.CrudRepository;
import io.mateu.uidl.interfaces.HttpRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ProcessCrudAdapter extends AutoCrudAdapter<ProcessRow> {

    final CreateProcesForm createProcesForm;
    final ProcessView processView;
    final ProcessRepository repository;

    @Override
    public Object getCreationForm(HttpRequest httpRequest) {
        return createProcesForm;
    }

    @Override
    public CrudRepository<ProcessRow> repository() {
        return repository;
    }

    @Override
    public Object getView(String id, HttpRequest httpRequest) {
        return processView.load(id);
    }
}
