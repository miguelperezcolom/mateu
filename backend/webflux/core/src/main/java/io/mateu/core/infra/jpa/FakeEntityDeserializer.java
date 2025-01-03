package io.mateu.core.infra.jpa;

import io.mateu.core.domain.model.util.persistence.EntityDeserializer;
import jakarta.persistence.EntityManager;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingClass;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnMissingClass("io.mateu.jpa.domain.json.MateuEntityDeserializer")
public class FakeEntityDeserializer implements EntityDeserializer {
  @Override
  public <T> T fromJson(EntityManager em, String json, Class<T> c) {
    return null;
  }
}
