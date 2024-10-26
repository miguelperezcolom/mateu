package com.example.demo.domain.nfl.entities;

import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Section;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Player {

  @Id private String id = UUID.randomUUID().toString();

  private String name;

  private Position position;

  @ManyToOne private Team team;

  @Section("Metrics")
  private int age;

  int weight;

  int height;

  @Override
  public String toString() {
    return name != null ? "" + name : "No name";
  }
}
