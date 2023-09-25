package com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain.environments;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Environment {

  @Id String id = UUID.randomUUID().toString();

  String name;

  String baseUrl;

  @Override
  public String toString() {
    return name;
  }
}
