package com.example.demoremote.domains.nfl.entities;

import io.mateu.mdd.shared.annotations.Section;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
