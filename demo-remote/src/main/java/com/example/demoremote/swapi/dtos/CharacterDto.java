package com.example.demoremote.swapi.dtos;

import lombok.Data;

@Data
public class CharacterDto {

    String url;

    private String name;

    private String height;

    private String mass;

    private String hair_color;

    private String gender;

    private String homeworld;

    private String[] films;

}
