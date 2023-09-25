package com.example.demoremote.ui.demoApp.menus.useCases.intermediaries.salesAgents;

import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

@Service
public class SalesAgentsRepo {

  List<SalesAgentsRow> all =
      new ArrayList(
          List.of(
              new SalesAgentsRow("1", "1001", "Michael Jordan"),
              new SalesAgentsRow("2", "1001", "Magic Johnson"),
              new SalesAgentsRow("3", "1002", "Kareem Abdul Jabbar")));

  public Flux<SalesAgentsRow> findAll() {
    return Flux.fromStream(all.stream());
  }
}
