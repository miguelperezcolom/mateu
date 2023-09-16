package com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain.tests.steps;

import io.mateu.mdd.shared.annotations.File;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class ScreenshotComparison extends TestStep {

  @File String mask;
}
