package com.example.demoremote.domains.swapi.dtos;

import lombok.Data;

@Data
public class StarshipsDto {

  private int count;

  private StarshipDto[] results;
}
