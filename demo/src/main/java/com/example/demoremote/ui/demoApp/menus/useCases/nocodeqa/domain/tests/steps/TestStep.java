package com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain.tests.steps;

import com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain.Status;
import com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain.tests.FreeTest;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public abstract class TestStep {

  @Id String id = UUID.randomUUID().toString();

  @ManyToOne @NotNull FreeTest test;

  String name;

  @io.mateu.mdd.shared.annotations.Status Status status;

  String comments;

  @Column(name = "_order")
  int order;
}
