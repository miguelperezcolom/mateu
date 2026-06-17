package com.example.demo.infra.in.ui.pages.processes;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrudAdapter;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class Processes extends AutoCrud<Process> {

    final AutoCrudAdapter<Process> adapter;

    @Override
    public AutoCrudAdapter<Process> simpleAdapter() {
        return adapter;
    }
}
