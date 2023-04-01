package com.example.demoremote.domains.swapi.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SWStarship {

    @Id
    String id = UUID.randomUUID().toString();

    String name;
    String model;
    String manufacturer;
    String cost_in_credits;
    String length;
    String max_atmosphering_speed;
    String crew;
    String passengers;
    String starship_class;
    String url;

    @Override
    public String toString() {
        return name != null?"" + name:"No name";
    }

}
