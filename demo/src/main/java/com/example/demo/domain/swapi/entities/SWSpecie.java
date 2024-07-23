package com.example.demo.domain.swapi.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
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
public class SWSpecie {

  @Id String id = UUID.randomUUID().toString();

  String name;
  String classification;
  String designation;
  String average_height;
  String average_lifespan;
  String url;

  @Override
  public String toString() {
    return name != null ? "" + name : "No name";
  }
}
