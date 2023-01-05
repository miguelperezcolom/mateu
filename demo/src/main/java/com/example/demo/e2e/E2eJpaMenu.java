package com.example.demo.e2e;

import com.example.demo.e2e.entities.CityEntity;
import com.example.demo.e2e.entities.ClassroomEntity;
import com.example.demo.e2e.entities.PersonEntity;
import com.example.demo.e2e.forms.*;
import io.mateu.mdd.shared.annotations.MenuOption;

public class E2eJpaMenu {

    @MenuOption
    private Class classrooms = ClassroomEntity.class;

    @MenuOption
    private Class persons = PersonEntity.class;

    @MenuOption
    private Class cities = CityEntity.class;


}
