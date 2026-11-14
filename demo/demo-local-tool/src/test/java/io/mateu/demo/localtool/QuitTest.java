package io.mateu.demo.localtool;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.demo.localtool.hardening.LaunchToken;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.server.context.WebServerApplicationContext;
import org.springframework.context.ConfigurableApplicationContext;

/**
 * The header's Quit: the goodbye is answered first, then Spring closes and the process exits.
 *
 * <p>The app is started by hand rather than with {@code @SpringBootTest}: Quit closes the context,
 * which the test framework's context cache does not expect.
 */
class QuitTest {

  static final String QUIT =
      """
      {"route":"","consumedRoute":"","actionId":"quit","serverSideType":"io.mateu.demo.localtool.Shell",
       "initiatorComponentId":"app-header-action","componentState":{},"appState":{},"parameters":{}}""";

  @Test
  void quitAnswersTheGoodbyeThenStopsTheApp() throws Exception {
    var exitStatus = new CompletableFuture<Integer>();
    ConfigurableApplicationContext context =
        new SpringApplicationBuilder(Application.class)
            .properties("local-tool.open-browser=false", "local-tool.idle-shutdown=0")
            // instead of System.exit, record the status
            .initializers(
                ctx ->
                    ctx.getBeanFactory()
                        .registerSingleton(
                            "testProcessExit", (Quit.ProcessExit) exitStatus::complete))
            .run();
    try {
      var http = new Http(((WebServerApplicationContext) context).getWebServer().getPort());
      var token = context.getBean(LaunchToken.class).value();
      var setCookie = http.get("/?t=" + token, http.loopback(), null).header("Set-Cookie");
      var cookie = setCookie.substring(0, setCookie.indexOf(';'));

      var answer = http.post("/mateu/v3/sync/", http.loopback(), cookie, QUIT);

      assertThat(answer.status()).isEqualTo(200);
      assertThat(answer.body()).contains("The tool has stopped");
      assertThat(exitStatus.get(10, TimeUnit.SECONDS)).isZero();
      assertThat(context.isActive()).isFalse();
    } finally {
      context.close();
    }
  }
}
