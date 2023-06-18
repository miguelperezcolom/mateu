package com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain.tests.steps;

import com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain.Status;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;

import java.util.UUID;

@Entity
public abstract class TestStep {

    @Id
    String id = UUID.randomUUID().toString();

    String name;

    Status status;

    String comments;

    @Column(name = "_order")
    int order;

}
