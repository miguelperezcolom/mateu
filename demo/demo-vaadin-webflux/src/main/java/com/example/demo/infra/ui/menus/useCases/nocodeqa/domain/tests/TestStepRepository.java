package com.example.demo.infra.ui.menus.useCases.nocodeqa.domain.tests;

import com.example.demo.infra.ui.menus.useCases.nocodeqa.domain.tests.steps.TestStep;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TestStepRepository extends JpaRepository<TestStep, String> {}
