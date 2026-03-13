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
public class Processes extends AutoCrudOrchestrator<Process> {

    final AutoCrudAdapter<Process> adapter;

    @Override
    public AutoCrudAdapter<Process> simpleAdapter() {
        return adapter;
    }
}
