package io.mateu.core.application.microfrontends;

import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.remote.RemoteDescriptor;
import io.mateu.uidl.remote.RemoteIdentityStrategy;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.Map;

/** The identity strategies Mateu ships, and the lookup by name over them and the app's beans. */
public final class RemoteIdentityStrategies {

  private final Map<String, RemoteIdentityStrategy> byName = new LinkedHashMap<>();

  public RemoteIdentityStrategies(Collection<RemoteIdentityStrategy> declared) {
    register(new None());
    register(new ForwardAuthorization());
    // the application's win over Mateu's own with the same name
    declared.forEach(this::register);
  }

  private void register(RemoteIdentityStrategy strategy) {
    if (strategy != null && strategy.name() != null) {
      byName.put(strategy.name(), strategy);
    }
  }

  /**
   * The strategy a remote names; {@value RemoteIdentityStrategy#FORWARD_AUTHORIZATION} when it
   * names none.
   *
   * @throws IllegalStateException when it names one nobody declared — a configuration error
   */
  public RemoteIdentityStrategy of(RemoteDescriptor remote) {
    var name =
        remote.identity() == null || remote.identity().isBlank()
            ? RemoteIdentityStrategy.FORWARD_AUTHORIZATION
            : remote.identity().trim();
    var strategy = byName.get(name);
    if (strategy == null) {
      throw new IllegalStateException(
          "Remote "
              + remote.id()
              + " names the identity strategy '"
              + name
              + "', but no RemoteIdentityStrategy bean is called so");
    }
    return strategy;
  }

  /** Anonymous. */
  static final class None implements RemoteIdentityStrategy {
    @Override
    public String name() {
      return NONE;
    }

    @Override
    public Map<String, String> headers(RemoteDescriptor remote, HttpRequest request) {
      return Map.of();
    }
  }

  /** The request's own {@code Authorization}, only ever to a registered remote. */
  static final class ForwardAuthorization implements RemoteIdentityStrategy {
    @Override
    public String name() {
      return FORWARD_AUTHORIZATION;
    }

    @Override
    public Map<String, String> headers(RemoteDescriptor remote, HttpRequest request) {
      var authorization = request == null ? null : request.getHeaderValue("authorization");
      return authorization == null || authorization.isBlank()
          ? Map.of()
          : Map.of("Authorization", authorization);
    }
  }
}
