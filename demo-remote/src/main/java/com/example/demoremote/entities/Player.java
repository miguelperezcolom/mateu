package com.example.demoremote.entities;

import io.mateu.mdd.shared.annotations.Section;
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

    private Position position;

    private String team;

    @Section("Metrics")
    private int age;

    int weight;

    int height;

    @Override
    public String toString() {
        return name != null?"" + name:"No name";
    }
}