package com.example.demo.e2e.entities;

import io.mateu.mdd.shared.annotations.UseCheckboxes;
import io.mateu.mdd.shared.annotations.UseChips;
import lombok.*;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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

    @ManyToMany@UseCheckboxes
    private Set<TeamEntity> fanOf = new HashSet<>();

    @Override
    public String toString() {
        return name;
    }
}
