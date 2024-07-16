package com.example.demo.infra.ui.menus.useCases.school;

import com.example.demo.infra.ui.menus.useCases.school.entities.Classroom;
import com.example.demo.infra.ui.menus.useCases.school.entities.School;
import com.example.demo.infra.ui.menus.useCases.school.entities.Student;
import com.example.demo.infra.ui.menus.useCases.school.entities.Teacher;
import io.mateu.mdd.shared.annotations.MenuOption;
import io.mateu.mdd.shared.interfaces.JpaCrud;

public class SchoolMenu {

  @MenuOption JpaCrud<School> schools;

  @MenuOption JpaCrud<Classroom> classrooms;

  @MenuOption JpaCrud<Student> students;

  @MenuOption JpaCrud<Teacher> teachers;
}
