package com.example.demo.infra.ui.menus.useCases.nocodeqa.domain.executions;

import com.example.demo.infra.ui.menus.useCases.nocodeqa.domain.environments.Environment;
import com.example.demo.infra.ui.menus.useCases.nocodeqa.domain.tests.Test;
import io.mateu.uidl.core.annotations.Action;
import io.mateu.uidl.core.annotations.ReadOnly;
import io.mateu.uidl.core.annotations.Status;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
public class TestExecution {

  @Id @ReadOnly String id = UUID.randomUUID().toString();

  @ManyToOne @ReadOnly Test test;

  @ManyToOne @ReadOnly
  Environment environment;

  @Column(name = "_when")
  @ReadOnly
  LocalDateTime when;

  @Status @ReadOnly TestResult result;

  @Action
  public String openLog() {
    return "Here we would see the log for this test";
  }
}
