package com.example.demo.infra.in.ui.pages.processes;

import io.mateu.core.infra.declarative.AutoCrudAdapter;
import io.mateu.core.infra.declarative.AutoCrudOrchestrator;
import io.mateu.uidl.interfaces.CrudRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class Steps extends AutoCrudOrchestrator<Step> {

    private String processId;

    public Steps withProcessId(String processId) {
        this.processId = processId;
        return this;
    }

    final AutoCrudAdapter<Step> adapter;

    @Override
    public AutoCrudAdapter<Step> simpleAdapter() {
        return adapter;
    }
}
