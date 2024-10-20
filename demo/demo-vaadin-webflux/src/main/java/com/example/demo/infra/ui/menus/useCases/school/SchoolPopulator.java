package com.example.demo.infra.ui.menus.useCases.school;

import com.example.demo.infra.ui.menus.useCases.school.entities.*;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class SchoolPopulator {

  final SchoolRepository schoolRepository;
  final ClassroomRepository classroomRepository;
  final StudentRepository studentRepository;
  final TeacherRepository teacherRepository;

  @PostConstruct
  public void populate() {

    var mateu = studentRepository.save(new Student("index", "Mateu"));
    var jose = studentRepository.save(new Student("jose", "José"));
    var marcos = studentRepository.save(new Student("marcos", "Marcos"));
    var rafel = teacherRepository.save(new GoodTeacher("rafel", "Rafel", 4));
    var miguel = teacherRepository.save(new BadTeacher("miguel", "Miguel", 20));
    var cuartoA =
        classroomRepository.save(new Classroom("4a", "Cuarto A", rafel, List.of(mateu, jose)));
    var primeroB =
        classroomRepository.save(new Classroom("1b", "Primero B", miguel, List.of(marcos)));
    var school =
        schoolRepository.save(new School("1", "Guillem Sagrera", List.of(cuartoA, primeroB)));
  }
}
