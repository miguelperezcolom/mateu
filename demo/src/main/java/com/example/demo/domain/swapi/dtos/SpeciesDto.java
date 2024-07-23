package com.example.demo.domain.swapi.dtos;

import lombok.Data;

@Data
public class SpeciesDto {

  private int count;

  private SpecieDto[] results;
}
