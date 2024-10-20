package com.example.demo.infra.ui.menus.useCases.nocodeqa.domain.tests.steps;

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
public class FillForm extends TestStep {

  @OneToMany(cascade = CascadeType.ALL)
  List<TestInput> inputs = new ArrayList<>();
}
