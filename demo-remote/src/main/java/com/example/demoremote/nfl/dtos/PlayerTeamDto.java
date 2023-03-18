package com.example.demoremote.nfl.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class PlayerTeamDto {

    @JsonProperty("$ref")
    private String ref;

}
