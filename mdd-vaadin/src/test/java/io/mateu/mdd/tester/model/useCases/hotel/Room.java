package io.mateu.mdd.tester.model.useCases.hotel;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Getter
@Setter
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;


    @ManyToOne
    private Hotel hotel;

    private String name;


    private int maxPax;

    private boolean active = true;

    @Override
    public String toString() {
        return name != null?name:"Room " + id;
    }
}
