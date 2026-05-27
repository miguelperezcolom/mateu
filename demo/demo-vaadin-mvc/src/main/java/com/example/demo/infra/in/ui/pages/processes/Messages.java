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
public class Messages extends AutoListOrchestrator<Message> {

    private String processId;

    public Messages withProcessId(String processId) {
        this.processId = processId;
        return this;
    }

    final AutoListAdapter<Message> adapter;

    @Override
    public AutoListAdapter<Message> simpleListAdapter() {
        return adapter;
    }
}
