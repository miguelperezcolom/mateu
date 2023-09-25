package com.example.demoremote.domains.nfl.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Team {

  @Id private String id;

  private String name;

  @Override
  public String toString() {
    return name != null ? "" + name : "No name";
  }
}
