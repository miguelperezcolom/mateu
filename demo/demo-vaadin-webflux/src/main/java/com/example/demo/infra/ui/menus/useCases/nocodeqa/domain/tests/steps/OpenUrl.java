package com.example.demo.infra.ui.menus.useCases.nocodeqa.domain.tests.steps;

import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class OpenUrl extends TestStep {

  String url;
}
