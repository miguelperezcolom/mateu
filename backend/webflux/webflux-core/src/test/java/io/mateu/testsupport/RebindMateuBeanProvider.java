package io.mateu.testsupport;

import io.mateu.SpringBeanProvider;
import io.mateu.uidl.di.MateuBeanProvider;
import org.springframework.test.context.TestContext;
import org.springframework.test.context.TestExecutionListener;

/**
 * Points Mateu's static bean facade at the context of the test class about to run.
 *
 * <p>{@link SpringBeanProvider} binds {@link MateuBeanProvider} when it is CONSTRUCTED, so the last
 * context Spring built wins — fine in an application, which has one. A test JVM has several, and
 * Spring's context cache hands a later class an EARLIER context while the facade still points at
 * whichever was built last: a request then saw another app's beans (UiModulesIT's ModulesApp has no
 * {@code /hello}, so AdapterParityIT's deep links answered 404 when it ran after it — a failure
 * that only showed in some test orders). Registered in META-INF/spring.factories.
 */
public class RebindMateuBeanProvider implements TestExecutionListener {

  @Override
  public void prepareTestInstance(TestContext testContext) {
    var context = testContext.getApplicationContext();
    var providers = context.getBeanProvider(SpringBeanProvider.class);
    providers.ifAvailable(MateuBeanProvider::setBeanProvider);
  }
}
