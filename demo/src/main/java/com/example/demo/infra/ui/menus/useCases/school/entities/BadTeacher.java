package com.example.demo.infra.ui.menus.useCases.school.entities;

import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class BadTeacher extends Teacher {

  private int dislikes;

  public BadTeacher(String id, String name, int dislikes) {
    super(id, name);
    this.dislikes = dislikes;
  }
}
