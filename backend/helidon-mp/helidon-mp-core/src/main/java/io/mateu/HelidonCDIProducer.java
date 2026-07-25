package io.mateu;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.infra.reflection.DefaultInstanceFactory;
import io.mateu.uidl.interfaces.RouteResolver;
import io.mateu.uidl.interfaces.RoutedClassProvider;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.context.Initialized;
import jakarta.enterprise.event.Observes;
import jakarta.enterprise.inject.Instance;
import jakarta.enterprise.inject.Produces;
import jakarta.inject.Inject;
import java.util.ArrayList;
import java.util.List;

/**
 * CDI producers for collection types that Spring auto-collects but CDI requires explicit producers.
 */
@ApplicationScoped
public class HelidonCDIProducer {

  @Inject Instance<RouteResolver> routeResolverBeans;

  @Inject Instance<RoutedClassProvider> routedClassProviderBeans;

  @Inject Instance<DefaultInstanceFactory> instanceFactory;

  /**
   * CDI beans are LAZY: {@code DefaultInstanceFactory} initializes the static {@code
   * MateuInstanceFactory} facade in its constructor, but nothing on the request path injects it
   * (the crud filter semantics call the static facade), so on Helidon it was never created and the
   * first filtered search threw "MateuInstanceFactory has not been initialized" (subsequent ones
   * worked once something else built it). Spring instantiates singletons eagerly, hiding the gap.
   * Force the bean to be built when the application scope is initialized — the Helidon MP / CDI
   * equivalent of Quarkus' {@code StartupEvent} observer.
   */
  void eagerlyInitStaticFactories(@Observes @Initialized(ApplicationScoped.class) Object event) {
    instanceFactory.get().toString();
  }

  @Produces
  public ObjectMapper objectMapper() {
    return new ObjectMapper();
  }

  @Produces
  public List<RouteResolver> routeResolvers() {
    var list = new ArrayList<RouteResolver>();
    routeResolverBeans.forEach(list::add);
    return list;
  }

  @Produces
  public List<RoutedClassProvider> routedClassProviders() {
    var list = new ArrayList<RoutedClassProvider>();
    routedClassProviderBeans.forEach(list::add);
    return list;
  }
}
