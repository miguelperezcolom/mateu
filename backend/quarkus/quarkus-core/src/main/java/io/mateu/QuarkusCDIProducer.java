package io.mateu;

import io.mateu.uidl.interfaces.RouteResolver;
import io.mateu.uidl.interfaces.RoutedClassProvider;
import jakarta.enterprise.context.ApplicationScoped;
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
