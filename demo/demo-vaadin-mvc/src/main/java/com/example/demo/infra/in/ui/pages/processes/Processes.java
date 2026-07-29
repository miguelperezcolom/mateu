package com.example.demo.infra.in.ui.pages.processes;

import com.example.demo.infra.out.persistence.ProcessCrudStore;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.interfaces.CrudStore;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class Processes extends AutoCrud<Process> {

    final ProcessCrudStore repository;

    @Override
    public CrudStore<Process> store() {
        return repository;
    }
}
