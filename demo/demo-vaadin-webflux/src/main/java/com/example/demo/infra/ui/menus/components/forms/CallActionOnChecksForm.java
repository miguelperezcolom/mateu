package com.example.demo.infra.ui.menus.components.forms;

import com.example.demo.infra.ui.menus.useCases.leads.QuestionsProvider;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.annotations.Label;
import lombok.Data;

import java.util.List;

@Data
@Title("Call action on check/uncheck")
public class CallActionOnChecksForm {

  @Section("List")
  @ValuesProvider(QuestionsProvider.class)
  @Label("")
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
