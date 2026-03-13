package com.example.demo.infra.in.ui.adapters;

import com.example.demo.infra.in.ui.pages.processes.Message;
import com.example.demo.infra.in.ui.pages.processes.Step;
import com.example.demo.infra.out.persistence.MessageCrudRepository;
import com.example.demo.infra.out.persistence.StepCrudRepository;
import io.mateu.core.infra.declarative.AutoCrudAdapter;
import io.mateu.uidl.interfaces.CrudRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MessageCrudAdapter extends AutoCrudAdapter<Message> {

    final MessageCrudRepository repository;

    @Override
    public CrudRepository<Message> repository() {
        return repository;
    }

}
