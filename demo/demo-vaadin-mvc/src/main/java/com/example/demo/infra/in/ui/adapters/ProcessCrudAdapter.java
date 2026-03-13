package com.example.demo.infra.in.ui.adapters;

import com.example.demo.infra.in.ui.pages.processes.Process;
import com.example.demo.infra.out.persistence.ProcessCrudRepository;
import io.mateu.core.infra.declarative.AutoCrudAdapter;
import io.mateu.uidl.interfaces.CrudAdapter;
import io.mateu.uidl.interfaces.CrudRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProcessCrudAdapter extends AutoCrudAdapter<Process> {

    final ProcessCrudRepository repository;

    @Override
    public CrudRepository<Process> repository() {
        return repository;
    }

}
