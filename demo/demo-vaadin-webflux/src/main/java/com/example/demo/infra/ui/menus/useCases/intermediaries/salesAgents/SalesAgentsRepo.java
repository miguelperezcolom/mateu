package com.example.demo.infra.ui.menus.useCases.intermediaries.salesAgents;

import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.util.ArrayList;
import java.util.List;

@Service
public class SalesAgentsRepo {

  final List<SalesAgentsRow> all =
      new ArrayList(
          List.of(
              new SalesAgentsRow("1", "1001", "Michael Jordan"),
              new SalesAgentsRow("2", "1001", "Magic Johnson"),
              new SalesAgentsRow("3", "1002", "Kareem Abdul Jabbar")));

  public Flux<SalesAgentsRow> findAll() {
    return Flux.fromStream(all.stream());
  }
}
