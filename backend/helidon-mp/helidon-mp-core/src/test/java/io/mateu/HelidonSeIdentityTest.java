package io.mateu;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;

import io.helidon.common.context.Context;
import io.helidon.security.SecurityContext;
import io.helidon.webserver.http.ServerRequest;
import jakarta.enterprise.inject.spi.Bean;
import jakarta.enterprise.inject.spi.BeanManager;
import java.lang.reflect.Proxy;
import java.security.Principal;
import java.util.Optional;
import java.util.Set;
import org.eclipse.microprofile.auth.LoginConfig;
import org.eclipse.microprofile.config.Config;
import org.junit.jupiter.api.Test;

/**
 * Who calls the routes served on the Helidon routing itself (SSE, MCP, YAML mounts): the principal
 * Helidon security authenticated, else nobody — and whether the app requires one at all.
 */
class HelidonSeIdentityTest {

  /** A JDK proxy answering the named methods; anything else returns null. */
  @SuppressWarnings("unchecked")
  private static <T> T fake(Class<T> type, java.util.Map<String, Object> answers) {
    return (T)
        Proxy.newProxyInstance(
            type.getClassLoader(),
            new Class<?>[] {type},
            (proxy, method, args) -> {
              switch (method.getName()) {
                case "hashCode":
                  return System.identityHashCode(proxy);
                case "equals":
                  return proxy == args[0];
                case "toString":
                  return type.getSimpleName() + "@fake";
                default:
                  break;
              }
              var answer = answers.get(method.getName());
              if (answer instanceof RuntimeException e) throw e;
              if (answer == null && method.getReturnType() == boolean.class) return false;
              return answer;
            });
  }

  private static ServerRequest requestWith(Context context) {
    return fake(ServerRequest.class, java.util.Map.of("context", context));
  }

  private static SecurityContext security(boolean authenticated, Object principal) {
    var answers = new java.util.HashMap<String, Object>();
    answers.put("isAuthenticated", authenticated);
    if (principal != null) answers.put("userPrincipal", principal);
    return fake(SecurityContext.class, answers);
  }

  private static Context contextHolding(SecurityContext security) {
    var context = Context.create();
    // as helidon-security's web integration does: by type, no classifier
    context.register(security);
    return context;
  }

  @Test
  void theCallerIsThePrincipalHelidonSecurityAuthenticated() {
    Principal leia = () -> "leia";
    var request = requestWith(contextHolding(security(true, Optional.of(leia))));
    assertSame(leia, HelidonSeIdentity.principalOf(request));
  }

  @Test
  void nobodyWhenTheRequestIsNotSecuredOrNotAuthenticated() {
    assertNull(HelidonSeIdentity.principalOf(requestWith(Context.create())));
    assertNull(
        HelidonSeIdentity.principalOf(
            requestWith(contextHolding(security(false, Optional.of((Principal) () -> "x"))))));
    assertNull(
        HelidonSeIdentity.principalOf(
            requestWith(contextHolding(security(true, Optional.empty())))));
    // a principal that is not a java.security.Principal is not an identity
    assertNull(
        HelidonSeIdentity.principalOf(
            requestWith(contextHolding(security(true, "not a principal")))));
  }

  @Test
  void aSecurityContextThatCannotBeReadIsNobody() {
    var broken =
        fake(ServerRequest.class, java.util.Map.of("context", new IllegalStateException()));
    assertNull(HelidonSeIdentity.principalOf(broken));
  }

  @LoginConfig(authMethod = "MP-JWT")
  static class SecuredApplication {}

  static class PlainBean {}

  private static Config config(Boolean required) {
    return fake(Config.class, java.util.Map.of("getOptionalValue", Optional.ofNullable(required)));
  }

  private static BeanManager beansOf(Class<?>... classes) {
    var beans = new java.util.LinkedHashSet<Bean<?>>();
    for (var type : classes) {
      beans.add(fake(Bean.class, java.util.Map.of("getBeanClass", type)));
    }
    return fake(BeanManager.class, java.util.Map.of("getBeans", Set.copyOf(beans)));
  }

  @Test
  void theDeclaredSettingWins() {
    assertTrue(HelidonSeIdentity.authenticationRequired(config(true), beansOf()));
    assertFalse(
        HelidonSeIdentity.authenticationRequired(config(false), beansOf(SecuredApplication.class)));
  }

  @Test
  void otherwiseAnApplicationAnnotatedLoginConfigRequiresIt() {
    assertTrue(
        HelidonSeIdentity.authenticationRequired(
            config(null), beansOf(PlainBean.class, SecuredApplication.class)));
    assertFalse(HelidonSeIdentity.authenticationRequired(config(null), beansOf(PlainBean.class)));
  }

  @Test
  void beansThatCannotBeScannedRequireNothing() {
    var broken = fake(BeanManager.class, java.util.Map.of("getBeans", new IllegalStateException()));
    assertFalse(HelidonSeIdentity.authenticationRequired(config(null), broken));
  }
}
