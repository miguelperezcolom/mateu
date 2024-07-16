package com.example.demo.domain.agnostic.providers;

import io.mateu.mdd.shared.data.ValuesListProvider;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IntegersProvider implements ValuesListProvider {

  @Override
  public List<Object> getAll() {
    return List.of(1, 2, 3, 5, 7, 9);
  }
}
