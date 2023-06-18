package com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain.executions;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter@Setter
public class TestExecution {

    @Id
    String id = UUID.randomUUID().toString();

    @Column(name = "_when")
    LocalDateTime when;

    TestResult result;

}
