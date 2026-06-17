package com.example.demo.infra.in.ui.pages.processes;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrudAdapter;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Style;
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

    final AutoCrudAdapter<Error> adapter;

    @Override
    public AutoCrudAdapter<Error> simpleAdapter() {
        return adapter;
    }
}
