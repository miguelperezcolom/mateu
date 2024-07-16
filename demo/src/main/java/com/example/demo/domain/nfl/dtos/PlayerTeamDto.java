package com.example.demo.domain.nfl.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class PlayerTeamDto {

  @JsonProperty("$ref")
  private String ref;
}
