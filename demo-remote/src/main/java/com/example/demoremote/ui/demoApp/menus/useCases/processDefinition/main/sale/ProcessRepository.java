package com.example.demoremote.ui.demoApp.menus.useCases.processDefinition.main.sale;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProcessRepository extends JpaRepository<Flow, String> {
}
