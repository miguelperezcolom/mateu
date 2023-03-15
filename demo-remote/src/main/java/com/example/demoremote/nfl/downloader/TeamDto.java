package com.example.demoremote.nfl.downloader;

import lombok.Data;

@Data
public class TeamDto {

    private String id;

    private String displayName;

    private String abbreviation;

    private TeamFranchiseDto franchise;

}
