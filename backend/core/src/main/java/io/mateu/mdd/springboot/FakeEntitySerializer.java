package io.mateu.mdd.springboot;

import io.mateu.util.persistence.EntitySerializer;
import java.util.Map;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingClass;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnMissingClass("io.mateu.mdd.json.MateuEntitySerializer")
public class FakeEntitySerializer implements EntitySerializer {
  @Override
  public Map<String, Object> toMap(Object entity) throws Exception {
    return null;
  }
}