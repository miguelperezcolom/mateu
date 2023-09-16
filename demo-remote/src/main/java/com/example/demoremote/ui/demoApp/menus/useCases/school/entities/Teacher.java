package com.example.demoremote.ui.demoApp.menus.useCases.school.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Teacher {

  @Id String id;

  String name;

  @Override
  public String toString() {
    return name;
  }
}
