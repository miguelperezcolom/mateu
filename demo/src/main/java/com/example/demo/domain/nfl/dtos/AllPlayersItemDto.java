package com.example.demo.domain.nfl.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class AllPlayersItemDto {

  @JsonProperty("$ref")
  protected String ref;
}
