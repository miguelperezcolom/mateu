package io.mateu.demo.localtool;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.demo.localtool.hardening.LaunchToken;
import io.mateu.demo.localtool.hardening.LocalToolGuard;
import java.net.InetAddress;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.tomcat.TomcatWebServer;
import org.springframework.boot.web.server.servlet.context.ServletWebServerApplicationContext;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

/** The local tool's hardening, over real HTTP: loopback only, the launch token and the Host check. */
@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT, // server.port=0 → a free port
    properties = {"local-tool.open-browser=false", "local-tool.idle-shutdown=0"})
@DirtiesContext // each class gets its own one-time token
class LocalToolGuardTest {

  static final String SYNC_BODY =
      """
      {"route":"","consumedRoute":"_empty","actionId":"","serverSideType":"io.mateu.demo.localtool.Shell",
       "initiatorComponentId":"ux","componentState":{},"appState":{},"parameters":{}}""";

  @Autowired ServletWebServerApplicationContext context;
  @Autowired LaunchToken token;
  @MockitoBean Quit.ProcessExit processExit; // never really exit the test JVM

  Http http() {
    return new Http(context.getWebServer().getPort());
  }

  @Test
  void itListensOnTheLoopbackInterfaceOnly() throws Exception {
    var connector = ((TomcatWebServer) context.getWebServer()).getTomcat().getConnector();
    var address = (InetAddress) connector.getProperty("address");
    assertThat(address.isLoopbackAddress()).isTrue();
  }

  @Test
  void withoutTheCookieNothingIsServed() throws Exception {
    var http = http();
    assertThat(http.get("/", http.loopback(), null).status()).isEqualTo(403);
    assertThat(http.post("/mateu/v3/sync/", http.loopback(), null, SYNC_BODY).status())
        .isEqualTo(403);
    assertThat(
            http.post(
                    "/mateu/v3/sync/",
                    http.loopback(),
                    LocalToolGuard.COOKIE + "=not-the-session",
                    SYNC_BODY)
                .status())
        .isEqualTo(403);
  }

  @Test
  void anotherHostIsRefusedEvenWithTheToken() throws Exception {
    var http = http();
    var rebound = http.get("/?t=" + token.value(), "attacker.example:" + http.port(), null);
    assertThat(rebound.status()).isEqualTo(403);
  }

  @Test
  void theTokenIsExchangedOnceForASameSiteStrictCookieThatOpensTheApp() throws Exception {
    var http = http();

    var first = http.get("/?t=" + token.value(), http.loopback(), null);
    assertThat(first.status()).isEqualTo(303);
    assertThat(first.header("Location")).isEqualTo("/");
    var setCookie = first.header("Set-Cookie");
    assertThat(setCookie).contains("HttpOnly").contains("SameSite=Strict");
    var cookie = setCookie.substring(0, setCookie.indexOf(';'));

    assertThat(http.get("/?t=" + token.value(), http.loopback(), null).status())
        .as("the token works once")
        .isEqualTo(403);

    assertThat(http.get("/", http.loopback(), cookie).status()).isEqualTo(200);
    assertThat(http.get("/", "localhost:" + http.port(), cookie).status()).isEqualTo(200);
    var sync = http.post("/mateu/v3/sync/", http.loopback(), cookie, SYNC_BODY);
    assertThat(sync.status()).isEqualTo(200);
    assertThat(sync.body()).contains("Largest files");

    assertThat(http.get("/", "attacker.example:" + http.port(), cookie).status())
        .as("a rebound name is refused even with the cookie")
        .isEqualTo(403);
  }
}
