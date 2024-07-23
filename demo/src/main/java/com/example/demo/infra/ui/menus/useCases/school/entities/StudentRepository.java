package com.example.demo.infra.ui.menus.useCases.school.entities;

import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<Student, String> {}
