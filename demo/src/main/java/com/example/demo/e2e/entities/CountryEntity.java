package com.example.demo.e2e.entities;

import lombok.*;

import javax.persistence.Entity;
import javax.persistence.Id;

@Entity
@Getter
@Setter
@EqualsAndHashCode(of = "id")
@AllArgsConstructor
@NoArgsConstructor
public class CountryEntity {

    @Id
    private String id;

    private String name;

    @Override
    public String toString() {
        return name;
    }

}
