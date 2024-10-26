package com.example.demo.infra.ui.menus.useCases.nocodeqa.domain.tests.steps;

import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.File;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class ScreenshotComparison extends TestStep {

  @File String mask;
}
