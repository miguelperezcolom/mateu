package com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain.tests;

import com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain.tests.steps.TestStep;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class FreeTest extends Test {

  @OneToMany(cascade = CascadeType.ALL, mappedBy = "test")
  List<TestStep> steps = new ArrayList<>();
}
