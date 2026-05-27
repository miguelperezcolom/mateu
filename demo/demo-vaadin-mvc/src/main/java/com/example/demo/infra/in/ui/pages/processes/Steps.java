package com.example.demo.infra.in.ui.pages.processes;

import io.mateu.core.infra.declarative.AutoListAdapter;
import io.mateu.core.infra.declarative.orchestrators.crudorchestrator.AutoListOrchestrator;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Style;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Style("width: 100%;")
@ReadOnly
public class Steps extends AutoListOrchestrator<Step> {

    private String processId;

    public Steps withProcessId(String processId) {
        this.processId = processId;
        return this;
    }

    final AutoListAdapter<Step> adapter;

    @Override
    public AutoListAdapter<Step> simpleListAdapter() {
        return adapter;
    }
}
