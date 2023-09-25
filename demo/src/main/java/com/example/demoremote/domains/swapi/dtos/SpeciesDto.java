package com.example.demoremote.domains.swapi.dtos;

import lombok.Data;

@Data
public class SpeciesDto {

  private int count;

  private SpecieDto[] results;
}
