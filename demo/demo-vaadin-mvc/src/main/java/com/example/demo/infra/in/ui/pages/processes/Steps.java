package com.example.demo.infra.in.ui.pages.processes;

import com.example.demo.infra.out.persistence.StepCrudRepository;
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
public class Steps extends AutoCrud<Step> {

    private String processId;

    public Steps withProcessId(String processId) {
        this.processId = processId;
        return this;
    }

    final StepCrudRepository repository;

    @Override
    public CrudRepository<Step> store() {
        return repository;
    }
}
