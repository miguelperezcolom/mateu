package com.example.demoremote.domains.agnostic.providers;

import io.mateu.mdd.shared.data.ValuesListProvider;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class IntegersProvider implements ValuesListProvider {

  @Override
  public List<Object> getAll() {
    return List.of(1, 2, 3, 5, 7, 9);
  }
}
