package com.example.demoremote.domains.nfl.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.Id;
import java.util.UUID;

@Entity
@Getter@Setter@AllArgsConstructor@NoArgsConstructor
public class Team {

    @Id
    private String id = UUID.randomUUID().toString();

    private String name;

    @Override
    public String toString() {
        return name != null?"" + name:"No name";
    }
}
