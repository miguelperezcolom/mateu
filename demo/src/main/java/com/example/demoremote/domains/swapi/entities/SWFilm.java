package com.example.demoremote.domains.swapi.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import java.time.LocalDate;
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
public class SWFilm {

  @Id String id = UUID.randomUUID().toString();

  String title;
  String episode_id;

  @Column(length = 6000)
  String opening_crawl;

  String director;
  String producer;
  LocalDate release_date;
  String url;

  @Override
  public String toString() {
    return title != null ? "" + title : "No name";
  }
}
