package com.example.demoremote.ui.demoApp.menus.useCases.school;

import com.example.demoremote.ui.demoApp.menus.useCases.school.entities.*;
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

        var mateu = studentRepository.save(new Student("mateu", "Mateu"));
        var jose = studentRepository.save(new Student("jose", "José"));
        var marcos = studentRepository.save(new Student("marcos", "Marcos"));
        var rafel = teacherRepository.save(new Teacher("rafel", "Rafel"));
        var cuartoA = classroomRepository.save(new Classroom("4a", "Cuarto A", rafel, List.of(mateu, jose)));
        var primeroB = classroomRepository.save(new Classroom("1b", "Primero B", rafel, List.of(marcos)));
        var school = schoolRepository.save(new School("1", "Guillem Sagrera", List.of(cuartoA, primeroB)));


    }
}

