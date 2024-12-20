package com.example.demo.infra.ui.menus.useCases.insurance.newLife;

import io.mateu.uidl.data.ItemsListProvider;
import io.mateu.uidl.data.Value;

import java.util.List;
import java.util.stream.Collectors;

public class OccupationsProvider implements ItemsListProvider {

  final List<String> all =
      List.of("Project Manager", "Engineer Manager", "Frontend Developer", "Backend Developer");

  @Override
  public List<Value> find(String search_text, int page, int page_size) {
    return all.stream()
        .filter(s -> s.toLowerCase().contains(search_text.toLowerCase()))
        .skip(page * page_size)
        .limit(page_size)
        .map(s -> new Value(s, s))
        .collect(Collectors.toList());
  }

  @Override
  public int count(String search_text) {
    return (int)
        all.stream().filter(s -> s.toLowerCase().contains(search_text.toLowerCase())).count();
  }
}
