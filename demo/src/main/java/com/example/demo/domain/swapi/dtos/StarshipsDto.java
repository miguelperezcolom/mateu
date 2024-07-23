package com.example.demo.domain.swapi.dtos;

import lombok.Data;

@Data
public class StarshipsDto {

  private int count;

  private StarshipDto[] results;
}
