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
public class Messages extends AutoCrudOrchestrator<Message> {

    private String processId;

    public Messages withProcessId(String processId) {
        this.processId = processId;
        return this;
    }

    final AutoCrudAdapter<Message> adapter;

    @Override
    public AutoCrudAdapter<Message> simpleAdapter() {
        return adapter;
    }
}
