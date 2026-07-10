package io.mateu;

import io.mateu.core.infra.reflection.DefaultInstanceFactory;
import io.mateu.uidl.interfaces.RouteResolver;
import io.mateu.uidl.interfaces.RoutedClassProvider;
import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.enterprise.inject.Instance;
import jakarta.enterprise.inject.Produces;
import jakarta.inject.Inject;
import java.util.ArrayList;
import java.util.List;

/**
 * CDI producers for collection types that Spring auto-collects but CDI requires explicit producers.
 * Spring automatically injects all beans of a type into a list; in CDI this requires @Produces.
 */
@ApplicationScoped
public class QuarkusCDIProducer {

  @Inject Instance<RouteResolver> routeResolverBeans;

  @Inject Instance<RoutedClassProvider> routedClassProviderBeans;

  @Inject Instance<DefaultInstanceFactory> instanceFactory;

  /**
   * CDI beans are LAZY: `DefaultInstanceFactory` initializes the static `MateuInstanceFactory`
   * facade in its constructor, but nothing on the request path injects it (the crud filter
   * semantics call the static facade), so on Quarkus it was never created and the first filtered
   * search threw "MateuInstanceFactory has not been initialized". Spring instantiates singletons
   * eagerly, hiding the gap. Force the bean to be built at startup here.
   */
  void eagerlyInitStaticFactories(@Observes StartupEvent ev) {
    instanceFactory.get().toString();
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
