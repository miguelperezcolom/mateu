package com.example.demo.entidades;

import lombok.*;

import javax.persistence.Entity;
import javax.persistence.Id;

@Entity
@Getter@Setter@EqualsAndHashCode(of = "id")
@AllArgsConstructor@NoArgsConstructor
public class PersonEntity {

    @Id
    private String id;

    private String name;

}