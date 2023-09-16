package com.example.demoremote.ui.demoApp.menus.useCases.school.entities;

import com.example.demoremote.ui.demoApp.menus.useCases.school.entities.School;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SchoolRepository extends JpaRepository<School, String> {
}
