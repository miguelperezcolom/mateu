package io.mateu.remote.domain.store;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class MenuToBeanMappingRepository {

  private Map<String, MenuToBeanMapping> mappings = new HashMap<>();

  public Optional<MenuToBeanMapping> findById(String actionId) {
    return Optional.ofNullable(mappings.get(actionId));
  }

  public void save(MenuToBeanMapping mapping) {
    mappings.put(mapping.getActionId(), mapping);
  }
}
