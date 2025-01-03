package com.example.demo.domain.cities;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class City {

  @Id private String id = UUID.randomUUID().toString();
  private String name;
  private String country;
  private int population;
  private String timezone;
  private LocalDate modificationDate;

  @Override
  public String toString() {
    return name != null ? "" + name : "No name";
  }
}
