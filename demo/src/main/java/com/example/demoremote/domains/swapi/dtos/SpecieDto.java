package com.example.demoremote.domains.swapi.dtos;

import lombok.Data;

@Data
public class SpecieDto {

  String name;
  String classification;
  String designation;
  String average_height;
  String average_lifespan;
  String language;
  String[] people;
  String[] films;
  String url;
}
