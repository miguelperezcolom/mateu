package com.example.demoremote;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.Id;
import java.util.UUID;

@Entity
@Getter@Setter@AllArgsConstructor@NoArgsConstructor
public class Player {

    @Id
    private String id = UUID.randomUUID().toString();

    private String name;

    private String position;

    private String team;

    private int age;

    int weight;

    int height;


}
