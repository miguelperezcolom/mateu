package io.mateu.core.domain;

import io.mateu.core.domain.model.modelToDtoMappers.UIMapper;
import io.mateu.core.domain.model.store.JourneyStoreService;
import io.mateu.core.infra.MateuConfiguratorBean;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UIRegistry {

  private List<Class> _classes = new ArrayList<>();

  @Autowired MateuConfiguratorBean mateuConfiguratorBean;

  @Autowired JourneyStoreService journeyStoreService;

  @Autowired UIMapper uiMapper;

  public void add(Class uiClass) {
    if (!_classes.contains(uiClass)) {
      _classes.add(uiClass);
    }
  }

  public List<Class> getUiClasses() {
    return _classes;
  }
}
