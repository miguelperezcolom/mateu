package com.example.demoremote.nfl.downloader;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class TeamFranchiseDto {

    @JsonProperty("$ref")
    private String ref;

}
