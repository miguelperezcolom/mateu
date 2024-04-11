package io.mateu.mdd.springboot;

import io.mateu.util.persistence.EntityDeserializer;
import jakarta.persistence.EntityManager;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingClass;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnMissingClass("io.mateu.mdd.json.MateuEntityDeserializer")
public class FakeEntityDeserializer implements EntityDeserializer {
  @Override
  public <T> T fromJson(EntityManager em, String json, Class<T> c) throws Exception {
    return null;
  }
}
