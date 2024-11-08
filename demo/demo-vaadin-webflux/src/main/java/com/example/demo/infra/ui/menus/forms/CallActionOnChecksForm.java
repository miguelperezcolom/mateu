package com.example.demo.infra.ui.menus.forms;

import com.example.demo.infra.ui.menus.useCases.leads.QuestionsProvider;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.annotations.Caption;
import io.mateu.uidl.annotations.*;
import lombok.Data;

import java.util.List;

@Data
@io.mateu.uidl.annotations.Caption("Call action on check/uncheck")
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
