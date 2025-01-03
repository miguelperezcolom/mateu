package com.example.demo.domain.swapi.dtos;

import lombok.Data;

@Data
public class StarshipDto {

  String name;
  String model;
  String manufacturer;
  String cost_in_credits;
  String length;
  String max_atmosphering_speed;
  String crew;
  String passengers;
  String cargo_capacity;
  String startship_class;
  String[] pilots;
  String[] films;
  String url;
}
