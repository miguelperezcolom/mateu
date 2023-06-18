package com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain.tests;

import com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain.Status;
import com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain.Status;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Getter@Setter
public abstract class Test {

    @Id
    String id = UUID.randomUUID().toString();

    String name;

    @io.mateu.mdd.shared.annotations.Status
    Status status;

    String comments;

}
