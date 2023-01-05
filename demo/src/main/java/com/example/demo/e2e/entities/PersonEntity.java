package com.example.demo.e2e.entities;

import lombok.*;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.ManyToOne;

@Entity
@Getter@Setter@EqualsAndHashCode(of = "id")
@AllArgsConstructor@NoArgsConstructor
public class PersonEntity {

    @Id
    private String id;

    private String name;

    @ManyToOne
    private CityEntity city;

    @ManyToOne
    private ClassroomEntity classroom;

    @Override
    public String toString() {
        return name;
    }
}
