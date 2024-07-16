package com.example.demo.infra.ui.menus.useCases.nocodeqa.domain.tests;

import com.example.demo.infra.ui.menus.useCases.nocodeqa.domain.Status;
import io.mateu.core.domain.uidefinition.shared.annotations.Section;
import io.mateu.core.domain.uidefinition.shared.annotations.TextArea;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Getter
@Setter
public class TestProject {

  @Section("General")
  @Id
  String id = UUID.randomUUID().toString();

  String name;

  @io.mateu.core.domain.uidefinition.shared.annotations.Status
  Status status;

  @TextArea String comments;

  @Section("Github")
  String githubRepository;

  String githubApiKey;

  @Override
  public String toString() {
    return name;
  }
}
