package com.example.demo.infra.in.ui.adapters;

import com.example.demo.infra.in.ui.pages.processes.Error;
import com.example.demo.infra.in.ui.pages.processes.Resource;
import com.example.demo.infra.out.persistence.ErrorCrudRepository;
import com.example.demo.infra.out.persistence.ResourceCrudRepository;
import io.mateu.core.infra.declarative.AutoListAdapter;
import io.mateu.uidl.interfaces.CrudRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ResourceCrudAdapter extends AutoListAdapter<Resource> {

    final ResourceCrudRepository repository;

    @Override
    public CrudRepository<Resource> repository() {
        return repository;
    }

}
