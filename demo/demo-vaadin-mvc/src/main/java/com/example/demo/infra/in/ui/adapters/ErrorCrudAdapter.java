package com.example.demo.infra.in.ui.adapters;

import com.example.demo.infra.in.ui.pages.processes.Error;
import com.example.demo.infra.in.ui.pages.processes.Step;
import com.example.demo.infra.out.persistence.ErrorCrudRepository;
import com.example.demo.infra.out.persistence.StepCrudRepository;
import io.mateu.core.infra.declarative.AutoCrudAdapter;
import io.mateu.uidl.interfaces.CrudRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ErrorCrudAdapter extends AutoCrudAdapter<Error> {

    final ErrorCrudRepository repository;

    @Override
    public CrudRepository<Error> repository() {
        return repository;
    }

}
