package com.example.demo.infra.ui.menus.useCases.school.entities;

import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class GoodTeacher extends Teacher {

  private int stars;


  public GoodTeacher(String id, String name, int stars) {
    super(id, name);
    this.stars = stars;
  }
}
