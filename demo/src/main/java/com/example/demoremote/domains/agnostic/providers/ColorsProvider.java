package com.example.demoremote.domains.agnostic.providers;

import io.mateu.mdd.shared.data.ValuesListProvider;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ColorsProvider implements ValuesListProvider {

  @Override
  public List<Object> getAll() {
    return List.of("Red", "Blue", "Yellow", "Orange", "Green", "White", "Black");
  }
}
