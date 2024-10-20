package io.mateu.core.infra;

import io.mateu.core.domain.model.outbound.modelToDtoMappers.EntityProvider;
import org.springframework.stereotype.Service;

@Service
public class DummyEntityProvider implements EntityProvider {
  @Override
  public Object find(Class type, Object id) {
    return null;
  }
}
