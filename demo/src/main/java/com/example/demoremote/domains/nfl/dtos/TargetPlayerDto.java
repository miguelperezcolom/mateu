package com.example.demoremote.domains.nfl.dtos;

import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class TargetPlayerDto {

  private String id;

  private String name;

  private String team;

  private String teamAbbreviation;

  private int height;

  private int weight;

  private int age;

  private String jersey;

  private String position;

  private String positionAbbreviation;
}
