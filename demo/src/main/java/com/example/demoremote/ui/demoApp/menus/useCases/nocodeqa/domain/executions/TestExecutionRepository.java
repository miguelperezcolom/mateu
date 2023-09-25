package com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain.executions;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TestExecutionRepository extends JpaRepository<TestExecution, String> {}
