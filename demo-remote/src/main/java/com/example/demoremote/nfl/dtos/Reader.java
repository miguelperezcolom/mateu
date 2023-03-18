package com.example.demoremote.nfl.dtos;

import io.mateu.util.Helper;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class Reader {

    public static void main(String[] args) throws IOException {

        String json = Helper.leerFichero(Reader.class, "/nfl.json");
        TargetPlayerDto[] players = Helper.fromJson(json, TargetPlayerDto[].class);
        System.out.println(players.length);

        List<String> teams = Arrays.stream(players).map(p -> p.getTeam()).distinct().collect(Collectors.toList());

        teams.forEach(t -> System.out.println(t));

        List<String> positions = Arrays.stream(players).map(p -> p.getPosition()).distinct().collect(Collectors.toList());

        positions.forEach(t -> System.out.println(t));

        System.out.println(positions.size());


    }

}
