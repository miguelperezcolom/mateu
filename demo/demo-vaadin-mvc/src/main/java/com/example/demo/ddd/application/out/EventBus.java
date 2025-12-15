package com.example.demo.ddd.application.out;

import com.example.demo.ddd.domain.shared.DomainEvent;

import java.util.List;

public interface EventBus {

    void sendAll(List<DomainEvent> events);

}
