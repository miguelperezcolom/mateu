package com.example.demo.infra.ui.menus.useCases.nocodeqa.domain.tests;

import com.example.demo.infra.ui.menus.useCases.nocodeqa.domain.tests.steps.TestStep;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
public class FreeTest extends Test {

  @OneToMany(cascade = CascadeType.ALL, mappedBy = "test")
  List<TestStep> steps = new ArrayList<>();
}
