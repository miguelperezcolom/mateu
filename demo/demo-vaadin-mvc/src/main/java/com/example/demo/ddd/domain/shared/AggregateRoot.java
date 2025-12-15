package com.example.demo.ddd.domain.shared;

import java.util.ArrayList;
import java.util.List;

public abstract class AggregateRoot {

    private final List<DomainEvent> events = new ArrayList<>();

    public void send(DomainEvent event) {
        events.add(event);
    }

    public List<DomainEvent> getEvents() {
        var accumulated = new ArrayList<DomainEvent>(events);
        events.clear();
        return accumulated;
    }

}
