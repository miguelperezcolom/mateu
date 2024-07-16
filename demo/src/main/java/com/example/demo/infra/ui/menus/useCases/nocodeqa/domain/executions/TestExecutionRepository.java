package com.example.demo.infra.ui.menus.useCases.nocodeqa.domain.executions;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TestExecutionRepository extends JpaRepository<TestExecution, String> {}
