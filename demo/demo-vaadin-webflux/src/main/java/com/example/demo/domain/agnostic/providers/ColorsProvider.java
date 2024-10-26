package com.example.demo.domain.agnostic.providers;

import io.mateu.core.domain.uidefinitionlanguage.shared.data.ValuesListProvider;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ColorsProvider implements ValuesListProvider {

  @Override
  public List<Object> getAll() {
    return List.of("Red", "Blue", "Yellow", "Orange", "Green", "White", "Black");
  }
}
