package com.example.demoremote;

import lombok.Getter;
import lombok.Setter;

@Getter@Setter
public class SwapiCharacter {

    private String id;

    private String name;

    private String url;

    public void setUrl(String url) {
        this.url = url;
        id = url.split("/")[url.split("/").length - 1];
    }
}
