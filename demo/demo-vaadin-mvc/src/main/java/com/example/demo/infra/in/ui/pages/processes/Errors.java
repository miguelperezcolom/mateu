package com.example.demo.infra.in.ui.pages.processes;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoListAdapter;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoListOrchestrator;
import io.mateu.uidl.annotations.Style;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Style("width: 100%;")
public class Errors extends AutoListOrchestrator<Error> {

    private String processId;

    public Errors withProcessId(String processId) {
        this.processId = processId;
        return this;
    }

    final AutoListAdapter<Error> adapter;

    @Override
    public AutoListAdapter<Error> simpleAdapter() {
        return adapter;
    }
}
