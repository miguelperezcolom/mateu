package com.example.demo.infra.in.ui.pages.processes;

import io.mateu.core.infra.declarative.AutoListAdapter;
import io.mateu.core.infra.declarative.AutoListOrchestrator;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Style;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Style("width: 100%;")
@ReadOnly
public class Resources extends AutoListOrchestrator<Resource> {

    private String processId;

    public Resources withProcessId(String processId) {
        this.processId = processId;
        return this;
    }

    final AutoListAdapter<Resource> adapter;

    @Override
    public AutoListAdapter<Resource> simpleListAdapter() {
        return adapter;
    }
}
