package com.example.demo.domain.swapi.dtos;

import lombok.Data;

@Data
public class FilmsDto {

  private int count;

  private FilmDto[] results;
}
