package com.example.demo.domain.swapi.dtos;

import lombok.Data;

@Data
public class PeopleDto {

  private int count;

  private String next;

  private CharacterDto[] results;
}
