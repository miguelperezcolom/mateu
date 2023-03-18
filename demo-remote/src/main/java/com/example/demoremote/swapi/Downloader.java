package com.example.demoremote.swapi;

import com.example.demoremote.swapi.dtos.CharacterDto;
import com.example.demoremote.swapi.dtos.PeopleDto;
import io.mateu.util.Helper;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class Downloader {

    public static void main(String[] args) throws IOException {

        String peopleUrl = "https://swapi.dev/api/people";
        String json = Helper.httpGet(peopleUrl + "?format=json");
        PeopleDto peopleDto = Helper.fromJson(json, PeopleDto.class);
        List<CharacterDto> characters = new ArrayList<>();
        while (peopleDto != null) {

            for (CharacterDto characterDto : peopleDto.getResults()) {
                characters.add(characterDto);
            }

            if (!"null".equals("" + peopleDto.getNext())) {
                json = Helper.httpGet(peopleDto.getNext());
                peopleDto = Helper.fromJson(json, PeopleDto.class);
            } else {
                peopleDto = null;
            }
        }

        String str = Helper.toJson(characters);
        BufferedWriter writer = new BufferedWriter(new FileWriter("d:/miguel/swapi_characters.json"));
        writer.write(str);
        writer.close();

    }

}
