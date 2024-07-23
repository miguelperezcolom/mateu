package com.example.demo.infra.ui.menus.useCases.nocodeqa.domain.environments;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

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
