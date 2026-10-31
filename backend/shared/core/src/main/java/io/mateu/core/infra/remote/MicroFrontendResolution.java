package io.mateu.core.infra.remote;

import io.mateu.core.application.microfrontends.DefaultCorrelationIdProvider;
import io.mateu.core.application.microfrontends.DefaultRemoteRegistry;
import io.mateu.core.application.microfrontends.InMemoryFragmentCacheStore;
import io.mateu.core.application.microfrontends.MicroFrontendServerResolver;
import io.mateu.core.application.microfrontends.MicroFrontendSettings;
import io.mateu.core.application.microfrontends.RemoteIdentityStrategies;
import io.mateu.core.application.out.MateuHttpClient;
import io.mateu.core.infra.MateuSettings;
import io.mateu.core.infra.WireMapper;
import io.mateu.core.infra.out.DefaultMateuHttpClient;
import io.mateu.core.infra.out.RemoteTargets;
import io.mateu.core.infra.security.IdentityResolver;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.remote.CorrelationIdProvider;
import io.mateu.uidl.remote.FragmentCacheStore;
import io.mateu.uidl.remote.MicroFrontendResolutionListener;
import io.mateu.uidl.remote.RemoteCatalogSupplier;
import io.mateu.uidl.remote.RemoteIdentityStrategy;
import io.mateu.uidl.remote.RemoteRegistry;
import java.net.URI;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * Builds the {@link MicroFrontendServerResolver} from the container: every collaborator is the
 * application's bean when it declares one, Mateu's own otherwise. Looked up once, the first time a
 * response needs it.
 */
public final class MicroFrontendResolution {

  private MicroFrontendResolution() {}

  public static MicroFrontendServerResolver fromContainer() {
    var registry = bean(RemoteRegistry.class);
    if (registry == null) {
      registry = new DefaultRemoteRegistry(beans(RemoteCatalogSupplier.class), MateuSettings::get);
    }
    var http = bean(MateuHttpClient.class);
    var cache = bean(FragmentCacheStore.class);
    var correlation = bean(CorrelationIdProvider.class);
    return new MicroFrontendServerResolver(
        registry,
        http != null ? http : new DefaultMateuHttpClient(),
        cache != null ? cache : new InMemoryFragmentCacheStore(),
        new RemoteIdentityStrategies(beans(RemoteIdentityStrategy.class)),
        correlation != null ? correlation : new DefaultCorrelationIdProvider(),
        new ArrayList<>(beans(MicroFrontendResolutionListener.class)),
        MicroFrontendSettings.from(MateuSettings::get),
        IdentityResolver::resolve,
        MicroFrontendResolution::selfBaseUrl,
        WireMapper.shared());
  }

  /**
   * This server's own base url, for a remote registered as a path on it: {@code
   * mateu.self-base-url}, else the adapter's view of the local socket — never a request header.
   */
  static String selfBaseUrl(HttpRequest request) {
    var self = RemoteTargets.configuredSelfBaseUrl();
    if (self == null && request != null) {
      self = request.getSelfBaseUrl();
    }
    if (self == null) {
      return null;
    }
    try {
      var uri = URI.create(self.replaceAll("/+$", ""));
      var scheme = uri.getScheme();
      if (!("http".equalsIgnoreCase(scheme) || "https".equalsIgnoreCase(scheme))
          || uri.getHost() == null
          || uri.getRawUserInfo() != null
          || (uri.getRawPath() != null && !uri.getRawPath().isEmpty())) {
        return null;
      }
      return uri.toString();
    } catch (IllegalArgumentException e) {
      return null;
    }
  }

  private static <T> T bean(Class<T> type) {
    try {
      return MateuBeanProvider.getSingletonBean(type);
    } catch (RuntimeException none) {
      return null;
    }
  }

  private static <T> Collection<T> beans(Class<T> type) {
    try {
      var found = MateuBeanProvider.getSingletonBeans(type);
      return found == null ? List.of() : found;
    } catch (RuntimeException none) {
      return List.of();
    }
  }
}
