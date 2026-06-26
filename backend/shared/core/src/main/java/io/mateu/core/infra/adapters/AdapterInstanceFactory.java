package io.mateu.core.infra.adapters;

import io.mateu.core.domain.ports.InstanceFactory;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.util.Map;
import reactor.core.publisher.Mono;

/**
 * Deserializes the state coming back on an action into the domain object, using the registered
 * {@link io.mateu.uidl.interfaces.ComponentAdapter}. Wins over the reflection default for adapted
 * types via a lower priority.
 */
@Named
@Singleton
public class AdapterInstanceFactory implements InstanceFactory {

  @Override
  public boolean supports(String className) {
    return AdapterRegistry.findByTypeName(className) != null;
  }

  @Override
  public int priority() {
    return 100;
  }

  @Override
  @SuppressWarnings("unchecked")
  public Mono<?> createInstance(
      String className, Map<String, Object> data, HttpRequest httpRequest) {
    var adapter = AdapterRegistry.findByTypeName(className);
    if (adapter == null) {
      return Mono.empty();
    }
    return Mono.justOrEmpty(adapter.deserialize(data, httpRequest));
  }
}
