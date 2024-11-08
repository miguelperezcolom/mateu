package com.example.demo.infra.ui.menus.useCases.nocodeqa.domain.tests.steps;

import io.mateu.uidl.annotations.ReadOnly;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

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
