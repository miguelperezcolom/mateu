package io.mateu.maven.bundle;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.ServerSocket;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TemporaryFolder;

/** The dev server on its own: what a static host with an SPA fallback answers, and no more. */
public class DevServerTest {

  @Rule public TemporaryFolder tmp = new TemporaryFolder();

  Path root;
  DevServer server;
  int port;

  @Before
  public void bundle() throws Exception {
    root = tmp.newFolder("bundle").toPath();
    Files.writeString(root.resolve("index.html"), "<html><body><p>app</p></body></html>");
    Files.createDirectories(root.resolve("assets"));
    Files.writeString(root.resolve("assets/app.css"), "p{}");
    Files.writeString(tmp.getRoot().toPath().resolve("secret.txt"), "secret");
  }

  @After
  public void close() {
    if (server != null) {
      server.close();
    }
  }

  private void start(boolean liveReload, String baseUrl) throws IOException {
    server = new DevServer(root, liveReload, baseUrl);
    port = server.start("localhost", 0);
  }

  private HttpURLConnection open(String path, String method) throws IOException {
    var connection =
        (HttpURLConnection) URI.create("http://localhost:" + port + path).toURL().openConnection();
    connection.setRequestMethod(method);
    return connection;
  }

  private String body(HttpURLConnection connection) throws IOException {
    var in =
        connection.getResponseCode() < 400
            ? connection.getInputStream()
            : connection.getErrorStream();
    try (in) {
      return in == null ? "" : new String(in.readAllBytes(), StandardCharsets.UTF_8);
    }
  }

  @Test
  public void filesAreServedWithTheirTypeAndEverythingElseIsTheIndex() throws Exception {
    start(true, "");

    var css = open("/assets/app.css", "GET");
    assertThat(css.getResponseCode()).isEqualTo(200);
    assertThat(css.getContentType()).startsWith("text/css");
    assertThat(body(css)).isEqualTo("p{}");

    var deep = open("/orders/7/edit?tab=lines", "GET");
    assertThat(deep.getContentType()).startsWith("text/html");
    assertThat(deep.getHeaderField("Cache-Control")).isEqualTo("no-store");
    assertThat(body(deep)).contains("<p>app</p>").contains(DevServer.script(DevServer.EVENTS_PATH));
  }

  @Test
  public void aPathOutsideTheBundleIsNeverServed() throws Exception {
    start(false, "");

    assertThat(body(open("/../secret.txt", "GET"))).doesNotContain("secret");
    assertThat(body(open("/%2e%2e/secret.txt", "GET"))).doesNotContain("secret");
  }

  @Test
  public void headAnswersWithoutABodyAndOtherMethodsAreRefused() throws Exception {
    start(false, "");

    var head = open("/", "HEAD");
    assertThat(head.getResponseCode()).isEqualTo(200);
    assertThat(body(head)).isEmpty();
    assertThat(open("/", "POST").getResponseCode()).isEqualTo(405);
  }

  @Test
  public void aBaseUrlPathIsWhereTheBundleIsServed() throws Exception {
    start(true, "/app/");

    assertThat(body(open("/app/assets/app.css", "GET"))).isEqualTo("p{}");
    assertThat(body(open("/app/orders", "GET"))).contains("/app" + DevServer.EVENTS_PATH);
    assertThat(open("/elsewhere", "GET").getResponseCode()).isEqualTo(404);
  }

  @Test
  public void withNoBundleYetThePageSaysSoAndWaitsForTheFix() throws Exception {
    Files.delete(root.resolve("index.html"));
    start(true, "");

    var page = open("/", "GET");
    assertThat(page.getResponseCode()).isEqualTo(503);
    assertThat(body(page)).contains("No bundle yet").contains("EventSource");
  }

  @Test
  public void aTakenPortMovesToTheNextFreeOne() throws Exception {
    try (var taken = new ServerSocket(0, 50, java.net.InetAddress.getLoopbackAddress())) {
      server = new DevServer(root, false, null);
      port = server.start("localhost", taken.getLocalPort());
      assertThat(port).isNotEqualTo(taken.getLocalPort());
      assertThat(body(open("/", "GET"))).contains("<p>app</p>");
    }
  }

  /** {@code npx serve} listens on every interface: the loopback bind alone would not notice. */
  @Test
  public void aPortTakenOnEveryInterfaceMovesToTheNextFreeOne() throws Exception {
    try (var taken = new ServerSocket(0)) {
      server = new DevServer(root, false, null);
      port = server.start("localhost", taken.getLocalPort());
      assertThat(port).isNotEqualTo(taken.getLocalPort());
    }
  }

  @Test
  public void aFailedBuildIsOneLineOnTheStream() throws Exception {
    start(true, "");
    var stream = open(DevServer.EVENTS_PATH, "GET");
    assertThat(stream.getContentType()).startsWith("text/event-stream");
    var in = stream.getInputStream();
    var connected = new String(in.readNBytes(": connected\n\n".length()), StandardCharsets.UTF_8);
    assertThat(connected).isEqualTo(": connected\n\n");
    while (server.clients() == 0) {
      Thread.sleep(10);
    }

    server.failed("first line\n  second line");

    var expected = "event: failed\ndata: first line second line\n\n";
    assertThat(new String(in.readNBytes(expected.length()), StandardCharsets.UTF_8))
        .isEqualTo(expected);
    server.close();
    assertThat(server.clients()).isZero();
  }

  @Test
  public void contentTypesFollowTheExtension() {
    assertThat(DevServer.contentType("app.JS")).startsWith("text/javascript");
    assertThat(DevServer.contentType("logo.svg")).isEqualTo("image/svg+xml");
    assertThat(DevServer.contentType("_redirects")).isEqualTo("application/octet-stream");
    assertThat(DevServer.basePathOf("https://cdn.example.com/app")).isEmpty();
    assertThat(DevServer.basePathOf(null)).isEmpty();
  }

  @Test
  public void noServiceWorkerWhileDeveloping() throws Exception {
    start(true, "");
    var worker = open("/mateu-sw.js", "GET");
    assertThat(worker.getResponseCode()).isEqualTo(200);
    assertThat(worker.getContentType()).startsWith("text/javascript");
    // the worker that unregisters itself, whatever the bundle on disk carries
    assertThat(body(worker)).contains("unregister()");
    var register = open("/pwa/register.js", "GET");
    assertThat(body(register)).isEqualTo(DevServer.NO_WORKER);
    assertThat(DevServer.contentType("manifest.webmanifest"))
        .isEqualTo("application/manifest+json");
  }
}
