package com.example.demoremote.domains.swapi.dtos;

import java.time.LocalDate;
import lombok.Data;

@Data
public class FilmDto {

  String title;
  String episode_id;
  String opening_crawl;
  String director;
  String producer;
  LocalDate release_date;
  String url;
}
