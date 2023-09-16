package com.example.demoremote.ui.demoApp.menus.useCases.school;

import com.example.demoremote.ui.demoApp.menus.useCases.school.entities.Classroom;
import com.example.demoremote.ui.demoApp.menus.useCases.school.entities.School;
import com.example.demoremote.ui.demoApp.menus.useCases.school.entities.Student;
import com.example.demoremote.ui.demoApp.menus.useCases.school.entities.Teacher;
import io.mateu.mdd.shared.annotations.MenuOption;
import io.mateu.mdd.shared.interfaces.JpaCrud;

public class SchoolMenu {

    @MenuOption
    JpaCrud<School> schools;

    @MenuOption
    JpaCrud<Classroom> classrooms;

    @MenuOption
    JpaCrud<Student> students;

    @MenuOption
    JpaCrud<Teacher> teachers;

}
