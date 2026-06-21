package com.example.demo.infra.in.ui.pages.processes;

import com.example.demo.infra.out.persistence.ResourceCrudRepository;
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
public class Resources extends AutoCrud<Resource> {

    private String processId;

    public Resources withProcessId(String processId) {
        this.processId = processId;
        return this;
    }

    final ResourceCrudRepository repository;

    @Override
    public CrudRepository<Resource> repository() {
        return repository;
    }
}
