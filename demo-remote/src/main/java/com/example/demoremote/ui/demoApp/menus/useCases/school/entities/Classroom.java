package com.example.demoremote.ui.demoApp.menus.useCases.school.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity@Getter@Setter@NoArgsConstructor@AllArgsConstructor
public class Classroom {

    @Id
    String id;

    String name;

    @ManyToOne
    Teacher teacher;

    @ManyToMany
    List<Student> students = new ArrayList<>();


    @Override
    public String toString() {
        return name;
    }
}
