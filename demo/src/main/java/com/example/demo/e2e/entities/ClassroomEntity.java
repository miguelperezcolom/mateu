package com.example.demo.e2e.entities;

import lombok.*;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@EqualsAndHashCode(of = "id")
@AllArgsConstructor
@NoArgsConstructor
public class ClassroomEntity {

    @Id
    private String id;

    private String name;

    @OneToMany(mappedBy = "classroom")
    private List<PersonEntity> students = new ArrayList<>();

    @Override
    public String toString() {
        return name;
    }

}
