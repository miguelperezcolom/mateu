package com.example.demoremote.nfl.downloader;

import lombok.Data;

@Data
public class PlayerDto {

    private String id;

    private String displayName;

    private int height;

    private int weight;

    private int age;

    private String jersey;

    private Position position;

    private PlayerTeamDto team;
}
