package com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain.executions;

import com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain.executions.TestExecution;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TestExecutionRepository extends JpaRepository<TestExecution, String> {
}
