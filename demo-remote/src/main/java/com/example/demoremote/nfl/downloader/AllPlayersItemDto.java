package com.example.demoremote.nfl.downloader;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class AllPlayersItemDto {

    @JsonProperty("$ref")
    protected String ref;

}
