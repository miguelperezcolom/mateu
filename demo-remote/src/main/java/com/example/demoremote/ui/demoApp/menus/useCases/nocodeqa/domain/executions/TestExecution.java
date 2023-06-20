package com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain.executions;

import com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain.environments.Environment;
import com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain.tests.Test;
import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.Status;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter@Setter
public class TestExecution {

    @Id
    String id = UUID.randomUUID().toString();

    @ManyToOne
    Test test;

    @ManyToOne
    Environment environment;

    @Column(name = "_when")
    LocalDateTime when;

    @Status
    TestResult result;

    @Action
    public String openLog() {
        return "Here we would see the log for this test";
    }

}
