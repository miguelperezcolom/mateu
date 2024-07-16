package com.example.demo.domain.swapi.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.core.domain.uidefinition.shared.annotations.FieldGroup;
import io.mateu.core.domain.uidefinition.shared.annotations.UseCheckboxes;
import io.mateu.core.domain.uidefinition.shared.annotations.UseChips;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SWCharacter {

  @Id String id = UUID.randomUUID().toString();

  @FieldGroup("Main data")
  private String name;

  private int height;

  private double mass;

  @FieldGroup("More data")
  private String hair_color;

  private String gender;

  private String homeworld;

  @OneToMany @UseCheckboxes @JsonIgnore private List<SWFilm> films = new ArrayList<>();

  @OneToMany @JsonIgnore @UseChips private List<SWStarship> starships = new ArrayList<>();

  @Override
  public String toString() {
    return name != null ? "" + name : "No name";
  }
}
