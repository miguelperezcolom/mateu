package com.example.demoremote.entities;

import io.mateu.mdd.shared.annotations.FieldGroup;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.Id;
import java.util.UUID;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SWCharacter {

    @Id
    String id = UUID.randomUUID().toString();

    @FieldGroup("Main data")
    private String name;

    private int height;

    private int mass;

    @FieldGroup("More data")
    private String hair_color;

    private String gender;

    private String homeworld;

    @Override
    public String toString() {
        return name != null?"" + name:"No name";
    }

}
