package com.example.demoremote.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.Id;
import java.util.UUID;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SWCharacter {

    @Id
    String id = UUID.randomUUID().toString();

    private String name;

    private int height;

    private int mass;

    private String hair_color;

    private String gender;

    private String homeworld;

}
