package com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain.tests.steps;

import io.mateu.mdd.shared.annotations.ReadOnly;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class TestInput {

  @Id @ReadOnly String id = UUID.randomUUID().toString();

  String label;

  @Column(name = "_value")
  String value;

  boolean required;

  String pattern;

  int min;

  int max;
}