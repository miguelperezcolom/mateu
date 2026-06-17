package io.mateu.mdd.demoadminpanel.infra.in.ui.processes;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoListAdapter;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoListOrchestrator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class Processes extends AutoListOrchestrator<ProcessRow> {

    final ProcessCrudAdapter adapter;


    @Override
    public AutoListAdapter<ProcessRow> simpleAdapter() {
        return adapter;
    }

    @Override
    public boolean readOnly() {
        return false;
    }
}
