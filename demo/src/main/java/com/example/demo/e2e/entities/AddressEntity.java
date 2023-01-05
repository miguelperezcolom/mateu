package com.example.demo.e2e.entities;

import lombok.*;

import javax.persistence.Embeddable;
import javax.persistence.Entity;
import javax.persistence.Id;

@Embeddable
@Getter
@Setter
@EqualsAndHashCode(of = "id")
@AllArgsConstructor
@NoArgsConstructor
public class AddressEntity {

    @Id
    private String id;

    private String name;

    @Override
    public String toString() {
        return name;
    }

}
