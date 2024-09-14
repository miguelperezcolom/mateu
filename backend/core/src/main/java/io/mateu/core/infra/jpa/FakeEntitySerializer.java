package io.mateu.core.infra.jpa;

import io.mateu.core.domain.model.util.persistence.EntitySerializer;
import java.util.Map;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingClass;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnMissingClass("io.mateu.jpa.domain.json.MateuEntitySerializer")
public class FakeEntitySerializer implements EntitySerializer {
  @Override
  public Map<String, Object> toMap(Object entity) {
    return null;
  }
}
