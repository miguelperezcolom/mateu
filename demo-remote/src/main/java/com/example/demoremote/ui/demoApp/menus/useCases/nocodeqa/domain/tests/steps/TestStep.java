package com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain.tests.steps;

import com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain.Status;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Getter@Setter
public abstract class TestStep {

    @Id
    String id = UUID.randomUUID().toString();

    String name;

    @io.mateu.mdd.shared.annotations.Status
    Status status;

    String comments;

    @Column(name = "_order")
    int order;

}
