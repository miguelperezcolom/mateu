package com.example.demo.infra.in.ui.adapters;

import com.example.demo.infra.in.ui.pages.processes.Message;
import com.example.demo.infra.out.persistence.MessageCrudRepository;
import io.mateu.core.infra.declarative.AutoListAdapter;
import io.mateu.uidl.interfaces.CrudRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MessageCrudAdapter extends AutoListAdapter<Message> {

    final MessageCrudRepository repository;

    @Override
    public CrudRepository<Message> repository() {
        return repository;
    }

}
