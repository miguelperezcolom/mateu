package com.example.demo.domain.nfl.providers;

import com.example.demo.domain.nfl.entities.PlayerRepository;
import io.mateu.uidl.core.data.ItemsListProvider;
import io.mateu.dtos.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PlayersProvider implements ItemsListProvider {

  private final PlayerRepository repo;

  public PlayersProvider(PlayerRepository repo) {
    this.repo = repo;
  }

  @Override
  public List find(String search_text, int page, int page_size) {
    return repo.findAll().stream()
        .filter(t -> t.getName().toLowerCase().contains(search_text.toLowerCase()))
        .map(t -> new Value(t.getName(), t.getId()))
        .skip(page)
        .limit(page_size)
        .collect(Collectors.toList());
  }

  @Override
  public int count(String search_text) {
    return (int)
        repo.findAll().stream()
            .filter(t -> t.getName().toLowerCase().contains(search_text.toLowerCase()))
            .count();
  }
}
