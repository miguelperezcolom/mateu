package com.example.demoremote.nfl.downloader;

import io.mateu.util.Helper;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Downloader {

    static Map<String, String> cache = new HashMap<>();

    public static void main(String[] args) throws IOException {
        String playersUrl = "https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/athletes?limit=1000&active=true";
        String json = Helper.httpGet(playersUrl);

        AllPlayersDto allPlayersDto = Helper.fromJson(json, AllPlayersDto.class);

        List<TargetPlayerDto> targetPlayers = new ArrayList<>();

        int position = 0;
        for (int page = 1; page <= allPlayersDto.getPageCount(); page++ ) {
            playersUrl = "https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/athletes?limit=1000&active=true&page=" + page;
            json = Helper.httpGet(playersUrl);

            AllPlayersDto pageDto = Helper.fromJson(json, AllPlayersDto.class);

            System.out.println(pageDto.getItems().length + " players in this page");

            for (int playerPos = 0; playerPos < pageDto.getItems().length; playerPos++) {
                System.out.println("processing player " + position + " of " + allPlayersDto.getCount());
                String playerJson = Helper.httpGet(allPlayersDto.getItems()[playerPos].getRef());
                PlayerDto playerDto = Helper.fromJson(playerJson, PlayerDto.class);
                String teamJson= getJson(playerDto.getTeam().getRef());
                TeamDto teamDto = Helper.fromJson(teamJson, TeamDto.class);
                String franchiseJson= getJson(teamDto.getFranchise().getRef());
                FranchiseDto franchiseDto = Helper.fromJson(franchiseJson, FranchiseDto.class);
                targetPlayers.add(TargetPlayerDto.builder()
                        .id(playerDto.getId())
                        .team(franchiseDto.getDisplayName())
                                .teamAbbreviation(franchiseDto.getAbbreviation())
                        .age(playerDto.getAge())
                        .height(playerDto.getHeight())
                        .jersey(playerDto.getJersey())
                        .name(playerDto.getDisplayName())
                        .position(playerDto.getPosition().getDisplayName())
                                .positionAbbreviation(playerDto.getPosition().getAbbreviation())
                        .weight(playerDto.getWeight())
                        .build());
                position++;
            }

        }


        String str = Helper.toJson(targetPlayers);
        BufferedWriter writer = new BufferedWriter(new FileWriter("d:/miguel/nfl.json"));
        writer.write(str);
        writer.close();

    }

    public static String getJson(String url) throws IOException {
        if (!cache.containsKey(url)) {
            String json= Helper.httpGet(url);
            cache.put(url, json);
        } else {
            System.out.println("got from cache");
        }
        return cache.get(url);
    }
}
