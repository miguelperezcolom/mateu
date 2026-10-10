package io.mateu.core.infra.valuegenerators;

import io.mateu.uidl.interfaces.ValueGenerator;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.util.UUID;

@Named
@Singleton
public class UUIDValueGenerator implements ValueGenerator {
  @Override
  public Object generate() {
    return UUID.randomUUID().toString();
  }
}
