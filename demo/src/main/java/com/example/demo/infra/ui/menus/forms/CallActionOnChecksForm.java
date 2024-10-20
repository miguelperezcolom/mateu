package com.example.demo.infra.ui.menus.forms;

import com.example.demo.infra.ui.menus.useCases.leads.QuestionsProvider;
import io.mateu.core.domain.uidefinition.shared.annotations.*;
import io.mateu.core.domain.uidefinition.shared.annotations.Caption;
import lombok.Data;

import java.util.List;

@Data
@Caption("Call action on check/uncheck")
public class CallActionOnChecksForm {

  @Section("List")
  @ValuesProvider(QuestionsProvider.class)
  @Caption("")
  @CallActionOnChange("assess")
  private List<String> questions = List.of("1");

  @Section("Assessment")
  @ReadOnly
  private String assessment;

  @Action
  public void assess() {
    assessment = "" + questions;
  }
}
