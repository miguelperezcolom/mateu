package com.example.demo.infra.ui.menus.useCases.school.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class School {

  @Id String id;

  String name;

  @OneToMany List<Classroom> classrooms = new ArrayList<>();

  @Override
  public String toString() {
    return name;
  }
}
