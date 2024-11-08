package com.example.demo.infra.ui.menus.useCases.nocodeqa.domain.tests;

import io.mateu.uidl.annotations.TextArea;
import jakarta.persistence.Entity;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class CrudTest extends Test {

  @NotBlank String menuOption;

  @TextArea @NotBlank String filters;

  @TextArea @NotBlank String columns;

  @TextArea @NotBlank String fields;
}
