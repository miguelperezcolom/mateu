package io.mateu.mdd.demoadminpanel.infra.in.ui.processes;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrudAdapter;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class Processes extends AutoCrud<ProcessRow> {

    final ProcessCrudAdapter adapter;

    @Override
    public AutoCrudAdapter<ProcessRow> simpleAdapter() {
        return adapter;
    }
}
