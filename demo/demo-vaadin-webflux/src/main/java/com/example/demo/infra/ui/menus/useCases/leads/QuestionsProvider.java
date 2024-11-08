package com.example.demo.infra.ui.menus.useCases.leads;

import io.mateu.uidl.data.ExternalReference;
import io.mateu.uidl.data.ValuesListProvider;

import java.util.List;

public class QuestionsProvider implements ValuesListProvider {
  @Override
  public List<Object> getAll() {
    return List.of(
        new ExternalReference("1", "AVAD score"),
        new ExternalReference("2", "The intermediary has..."),
        new ExternalReference("3", "The intermediary has..."));
  }
}
