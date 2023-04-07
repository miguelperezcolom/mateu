package com.example.demoremote.domains.nfl.entities;

import io.mateu.mdd.shared.annotations.Section;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import java.util.UUID;

@Entity
@Getter@Setter@AllArgsConstructor@NoArgsConstructor
public class Player {

    @Id
    private String id = UUID.randomUUID().toString();

    private String name;

    private Position position;

    @ManyToOne
    private Team team;

    @Section("Metrics")
    private int age;

    int weight;

    int height;

    @Override
    public String toString() {
        return name != null?"" + name:"No name";
    }
}
