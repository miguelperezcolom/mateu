package com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain.environments;

import com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain.environments.Environment;
import com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain.tests.steps.TestStep;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnvironmentRepository extends JpaRepository<Environment, String> {
}
