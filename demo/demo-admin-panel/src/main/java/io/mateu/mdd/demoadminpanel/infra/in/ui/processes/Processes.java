package io.mateu.mdd.demoadminpanel.infra.in.ui.processes;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.interfaces.CrudRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class Processes extends AutoCrud<ProcessRow> {

    final ProcessRepository repository;

    @Override
    public CrudRepository<ProcessRow> store() {
        return repository;
    }
}
