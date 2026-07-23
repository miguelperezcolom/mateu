package com.example.demo.infra.in.ui.pages.processes;

import com.example.demo.infra.out.persistence.ProcessCrudRepository;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.interfaces.CrudRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class Processes extends AutoCrud<Process> {

    final ProcessCrudRepository repository;

    @Override
    public CrudRepository<Process> store() {
        return repository;
    }
}
