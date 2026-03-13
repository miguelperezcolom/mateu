package com.example.demo.infra.out.persistence;

import com.example.demo.infra.in.ui.pages.processes.Message;
import com.example.demo.infra.in.ui.pages.processes.Step;
import org.springframework.stereotype.Service;

@Service
public class MessageCrudRepository extends AbstractAutoRepository<Message> {
}
