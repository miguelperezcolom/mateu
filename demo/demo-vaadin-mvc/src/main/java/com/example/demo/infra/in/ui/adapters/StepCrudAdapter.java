package com.example.demo.infra.in.ui.adapters;

import com.example.demo.infra.in.ui.pages.processes.Step;
import com.example.demo.infra.out.persistence.StepCrudRepository;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrudAdapter;
import io.mateu.uidl.interfaces.CrudRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StepCrudAdapter extends AutoCrudAdapter<Step> {

    final StepCrudRepository repository;

    @Override
    public CrudRepository<Step> repository() {
        return repository;
    }
}
