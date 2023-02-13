package com.example.demo.e2e.entities;

import lombok.*;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.ManyToMany;
import javax.persistence.OneToMany;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@EqualsAndHashCode(of = "id")
@AllArgsConstructor
@NoArgsConstructor
public class TeamEntity {

    @Id
    private String id;

    private String name;

    private String owner;

    private int superBowls;

    @ManyToMany(mappedBy = "fanOf")
    private List<PersonEntity> fans = new ArrayList<>();

    @Override
    public String toString() {
        return name;
    }

}
