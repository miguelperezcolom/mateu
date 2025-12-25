package com.example.demo.ddd.infra.out.async;

import com.example.demo.ddd.application.out.EventBus;
import com.example.demo.ddd.domain.shared.DomainEvent;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LocalEventBus implements EventBus {

    @Override
    public void sendAll(List<DomainEvent> events) {

    }
}
