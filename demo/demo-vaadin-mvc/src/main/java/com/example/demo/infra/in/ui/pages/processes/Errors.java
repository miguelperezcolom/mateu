package com.example.demo.infra.in.ui.pages.processes;

import com.example.demo.infra.out.persistence.ErrorCrudRepository;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.interfaces.CrudRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@ReadOnly
@Style("width: 100%;")
public class Errors extends AutoCrud<Error> {

    private String processId;

    public Errors withProcessId(String processId) {
        this.processId = processId;
        return this;
    }

    final ErrorCrudRepository repository;

    @Override
    public CrudRepository<Error> repository() {
        return repository;
    }
}
