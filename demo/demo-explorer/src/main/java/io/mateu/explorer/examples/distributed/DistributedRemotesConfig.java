package io.mateu.explorer.examples.distributed;

import io.mateu.uidl.remote.RemoteCatalogSupplier;
import io.mateu.uidl.remote.RemoteDescriptor;
import io.mateu.uidl.remote.RemoteIdentityStrategy;
import java.util.List;
import java.util.Map;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * The remotes this host may call ON THE USER'S BEHALF — a micro frontend with {@code resolve =
 * SERVER} (and every {@code @ContentSlot}) is only resolved when its url is under one of them;
 * anything else is a configuration error and nothing is asked. A url belongs to the remote with the
 * LONGEST matching base url, so one host can be several remotes with different budgets and
 * identities.
 *
 * <p>Declared in code ({@link RemoteCatalogSupplier}) because the urls come from env vars; the
 * properties twin is {@code mateu.remotes=inventory,slow,…} + {@code
 * mateu.remotes.<id>.base-url|timeout-ms|identity}.
 */
@Configuration
public class DistributedRemotesConfig {

  /** The name the {@code id-custom} remote asks for. */
  public static final String DEMO_USER_STRATEGY = "explorer-demo-user";

  @Bean
  RemoteCatalogSupplier explorerRemotes() {
    var java = Remotes.java();
    return () ->
        List.of(
            // everything the Java remote serves: 500 ms per call (the default), the caller's token
            new RemoteDescriptor("inventory", java, null, RemoteIdentityStrategy.FORWARD_AUTHORIZATION),
            // the deliberately slow fragment: a 300 ms budget, then the browser asks it itself
            new RemoteDescriptor("slow", java + "/mf-slow", 300, null),
            // the content service of @ContentSlot (mateu.content-slots.remote defaults to "content")
            new RemoteDescriptor("content", java + "/content-hub", 500, null),
            // three identity strategies against the same echo
            new RemoteDescriptor(
                "id-forward", java + "/id-forward", null, RemoteIdentityStrategy.FORWARD_AUTHORIZATION),
            new RemoteDescriptor("id-none", java + "/id-none", null, RemoteIdentityStrategy.NONE),
            new RemoteDescriptor("id-custom", java + "/id-custom", null, DEMO_USER_STRATEGY),
            // nothing listens there: a remote that is down
            new RemoteDescriptor("down", Remotes.down(), 300, null));
  }

  /**
   * An app-provided identity strategy, chosen by name per remote. Token exchange, a service
   * account, a signed assertion — whatever the remote accepts — is the app's: Mateu only calls it.
   */
  @Bean
  RemoteIdentityStrategy explorerDemoUser() {
    return new RemoteIdentityStrategy() {
      @Override
      public String name() {
        return DEMO_USER_STRATEGY;
      }

      @Override
      public Map<String, String> headers(
          RemoteDescriptor remote, io.mateu.uidl.interfaces.HttpRequest httpRequest) {
        return Map.of("X-Demo-User", "explorer-visitor");
      }
    };
  }
}
