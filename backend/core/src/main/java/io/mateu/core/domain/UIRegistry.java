package io.mateu.core.domain;

import io.mateu.core.infra.MateuConfiguratorBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class UIRegistry {

  private List<Class> _classes = new ArrayList<>();

  @Autowired MateuConfiguratorBean mateuConfiguratorBean;

  public void add(Class uiClass) {
    if (!_classes.contains(uiClass)) {
      _classes.add(uiClass);
    }
  }

  public List<Class> getUiClasses() {
    return _classes;
  }
}
