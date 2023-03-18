package com.example.demoremote.cities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.Id;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class City {

    @Id
    private String id = UUID.randomUUID().toString();
    private String name;
    private String country;
    private int population;
    private String timezone;
    private LocalDate modificationDate;

}
