package com.example.demoremote.ui.demoApp.menus.useCases.nocodeqa.domain.tests.steps;

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
public class FillForm extends TestStep {

  @OneToMany(cascade = CascadeType.ALL)
  List<TestInput> inputs = new ArrayList<>();
}
