package com.example.demo.domain.swapi.dtos;

import lombok.Data;

import java.time.LocalDate;

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
