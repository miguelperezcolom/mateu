package io.mateu.maven.bundle;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.OutputStream;
import java.net.BindException;
import java.net.InetSocketAddress;
import java.net.ServerSocket;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

/**
 * The {@code dev} goal's web server: the bundle directory over HTTP with the SPA fallback a static
 * host gives it (every path that is not a file answers {@code index.html}), plus — with live reload
 * on — a Server-Sent Events stream at {@value #EVENTS_PATH} and a small script injected into the
 * served {@code index.html} that reloads the page when a rebuild succeeds. The script is added on
 * the way out: the bundle on disk is exactly what {@code mateu-bundle:bundle} writes.
 *
 * <p>JDK only ({@code com.sun.net.httpserver}), one virtual thread per exchange, so an open event
 * stream never holds up a page load. Bound to the loopback interface unless told otherwise.
 *
 * <p>A rebuild swaps the directory under {@link #swap}: requests read under a read lock, so none
 * sees a half-replaced bundle.
 */
final class DevServer implements AutoCloseable {

  /** The live-reload stream. Not under {@code /mateu/}: that is a served app's dev endpoint. */
  static final String EVENTS_PATH = "/__mateu/dev/events";

  /** How many ports after the asked one are tried when it is taken. */
  static final int PORT_ATTEMPTS = 10;

  static final long PING_SECONDS = 15;

  private static final String INDEX = "index.html";

  private static final Map<String, String> CONTENT_TYPES =
      Map.ofEntries(
          Map.entry("html", "text/html; charset=utf-8"),
          Map.entry("js", "text/javascript; charset=utf-8"),
          Map.entry("mjs", "text/javascript; charset=utf-8"),
          Map.entry("css", "text/css; charset=utf-8"),
          Map.entry("json", "application/json; charset=utf-8"),
          Map.entry("map", "application/json; charset=utf-8"),
          Map.entry("txt", "text/plain; charset=utf-8"),
          Map.entry("xml", "application/xml; charset=utf-8"),
          Map.entry("svg", "image/svg+xml"),
          Map.entry("png", "image/png"),
          Map.entry("jpg", "image/jpeg"),
          Map.entry("jpeg", "image/jpeg"),
          Map.entry("gif", "image/gif"),
          Map.entry("webp", "image/webp"),
          Map.entry("ico", "image/x-icon"),
          Map.entry("woff", "font/woff"),
          Map.entry("woff2", "font/woff2"),
          Map.entry("ttf", "font/ttf"),
          Map.entry("wasm", "application/wasm"));

  private final Path root;
  private final boolean liveReload;
  private final String basePath;
  private final ReadWriteLock lock = new ReentrantReadWriteLock();
  private final List<Client> clients = new CopyOnWriteArrayList<>();
  private ExecutorService executor;
  private ScheduledExecutorService pinger;
  private HttpServer server;

  /** One open event stream: closed by the stream's own failure or by {@link #close()}. */
  private record Client(OutputStream out, CountDownLatch closed) {}

  /**
   * @param root the bundle directory served
   * @param liveReload inject the reload script and serve {@value #EVENTS_PATH}
   * @param baseUrl the bundle's {@code baseUrl}: when it is a path ({@code /app}) the bundle is
   *     served under it, as the host it is built for would
   */
  DevServer(Path root, boolean liveReload, String baseUrl) {
    this.root = root.toAbsolutePath().normalize();
    this.liveReload = liveReload;
    this.basePath = basePathOf(baseUrl);
  }

  static String basePathOf(String baseUrl) {
    if (baseUrl == null || !baseUrl.startsWith("/")) {
      return "";
    }
    var trimmed = baseUrl;
    while (trimmed.endsWith("/")) {
      trimmed = trimmed.substring(0, trimmed.length() - 1);
    }
    return trimmed;
  }

  /**
   * Starts serving on {@code port} (0 = any free one) or, when it is taken, on the next free one of
   * the following {@value #PORT_ATTEMPTS}.
   *
   * @return the port actually bound
   */
  int start(String host, int port) throws IOException {
    var attempts = port == 0 ? 1 : PORT_ATTEMPTS;
    BindException last = null;
    for (int i = 0; i < attempts; i++) {
      try {
        if (port != 0) {
          probeWildcard(port + i);
        }
        server = HttpServer.create(new InetSocketAddress(host, port + i), 0);
        last = null;
        break;
      } catch (BindException e) {
        last = e;
      }
    }
    if (last != null) {
      throw new IOException(
          "ports "
              + port
              + "–"
              + (port + attempts - 1)
              + " are all taken; choose another with -Dmateu.dev.port",
          last);
    }
    executor = Executors.newVirtualThreadPerTaskExecutor();
    server.setExecutor(executor);
    server.createContext("/", this::handle);
    server.start();
    pinger = Executors.newSingleThreadScheduledExecutor(Thread.ofVirtual().factory());
    pinger.scheduleAtFixedRate(
        () -> send(": ping\n\n"), PING_SECONDS, PING_SECONDS, TimeUnit.SECONDS);
    return server.getAddress().getPort();
  }

  /**
   * Fails when another server listens on {@code port} on every interface ({@code npx serve} does):
   * binding the loopback address alone would still succeed beside it, and {@code localhost} — tried
   * as {@code ::1} first by browsers — would reach the other server instead of this one.
   */
  private static void probeWildcard(int port) throws IOException {
    try (var probe = new ServerSocket()) {
      probe.bind(new InetSocketAddress(port));
    }
  }

  /** Runs {@code change} (replacing the bundle directory) while no request is reading it. */
  void swap(IoAction change) throws IOException {
    lock.writeLock().lock();
    try {
      change.run();
    } finally {
      lock.writeLock().unlock();
    }
  }

  /** Something done to the bundle directory. */
  @FunctionalInterface
  interface IoAction {
    void run() throws IOException;
  }

  /** Tells every open page to reload (a rebuild succeeded). */
  void reload() {
    send("event: reload\ndata: reload\n\n");
  }

  /** Tells every open page that a rebuild failed (logged in its console; the page stays). */
  void failed(String message) {
    var oneLine = message == null ? "" : message.replaceAll("\\s*[\\r\\n]+\\s*", " ").trim();
    send("event: failed\ndata: " + oneLine + "\n\n");
  }

  int clients() {
    return clients.size();
  }

  private void send(String frame) {
    var bytes = frame.getBytes(StandardCharsets.UTF_8);
    for (var client : clients) {
      try {
        synchronized (client) {
          client.out().write(bytes);
          client.out().flush();
        }
      } catch (IOException e) {
        drop(client);
      }
    }
  }

  private void drop(Client client) {
    clients.remove(client);
    client.closed().countDown();
  }

  @Override
  public void close() {
    for (var client : clients) {
      drop(client);
    }
    if (pinger != null) {
      pinger.shutdownNow();
    }
    if (server != null) {
      server.stop(0);
    }
    if (executor != null) {
      executor.shutdownNow();
    }
  }

  private void handle(HttpExchange exchange) throws IOException {
    try (exchange) {
      var method = exchange.getRequestMethod();
      var head = "HEAD".equals(method);
      if (!head && !"GET".equals(method)) {
        respond(exchange, 405, "text/plain; charset=utf-8", new byte[0], false);
        return;
      }
      var path = exchange.getRequestURI().getPath();
      if (!basePath.isEmpty()) {
        if (!path.equals(basePath) && !path.startsWith(basePath + "/")) {
          respond(exchange, 404, "text/plain; charset=utf-8", bytes("Not found"), head);
          return;
        }
        path = path.substring(basePath.length());
      }
      if (liveReload && EVENTS_PATH.equals(path)) {
        stream(exchange);
        return;
      }
      serve(exchange, path, head);
    }
  }

  private void serve(HttpExchange exchange, String path, boolean head) throws IOException {
    byte[] body;
    String file;
    lock.readLock().lock();
    try {
      var resolved = resolve(path);
      if (resolved == null) {
        respond(
            exchange,
            503,
            "text/html; charset=utf-8",
            inject(
                "<!doctype html><html><head><title>Mateu dev</title></head><body><p>No bundle"
                    + " yet: the build failed — see the console. This page reloads when it is"
                    + " fixed.</p></body></html>"),
            head);
        return;
      }
      file = resolved.getFileName().toString();
      body = Files.readAllBytes(resolved);
    } finally {
      lock.readLock().unlock();
    }
    if (INDEX.equals(file)) {
      body = inject(new String(body, StandardCharsets.UTF_8));
    }
    respond(exchange, 200, contentType(file), body, head);
  }

  /** The file to answer {@code path} with: itself when it is a file, else the SPA's index. */
  private Path resolve(String path) {
    var relative = path.startsWith("/") ? path.substring(1) : path;
    var candidate = root.resolve(relative).normalize();
    if (candidate.startsWith(root)) {
      if (Files.isRegularFile(candidate)) {
        return candidate;
      }
      if (Files.isRegularFile(candidate.resolve(INDEX))) {
        return candidate.resolve(INDEX);
      }
    }
    var index = root.resolve(INDEX);
    return Files.isRegularFile(index) ? index : null;
  }

  private byte[] inject(String html) {
    if (!liveReload) {
      return bytes(html);
    }
    var script = script(basePath + EVENTS_PATH);
    var at = html.lastIndexOf("</body>");
    return bytes(at < 0 ? html + script : html.substring(0, at) + script + html.substring(at));
  }

  /** The live-reload client: reload on a successful rebuild, log a failed one. */
  static String script(String eventsUrl) {
    return "<script>/* mateu dev: live reload */(function(){var s=new EventSource('"
        + eventsUrl
        + "');s.addEventListener('reload',function(){location.reload();});"
        + "s.addEventListener('failed',function(e){console.error('[mateu dev] rebuild failed: '"
        + "+e.data);});})();</script>";
  }

  private void stream(HttpExchange exchange) throws IOException {
    var headers = exchange.getResponseHeaders();
    headers.set("Content-Type", "text/event-stream; charset=utf-8");
    headers.set("Cache-Control", "no-store");
    exchange.sendResponseHeaders(200, 0);
    var out = exchange.getResponseBody();
    var client = new Client(out, new CountDownLatch(1));
    out.write(bytes(": connected\n\n"));
    out.flush();
    clients.add(client);
    try {
      client.closed().await();
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
    } finally {
      clients.remove(client);
    }
  }

  private static void respond(
      HttpExchange exchange, int status, String contentType, byte[] body, boolean head)
      throws IOException {
    var headers = exchange.getResponseHeaders();
    headers.set("Content-Type", contentType);
    headers.set("Cache-Control", "no-store");
    if (head) {
      exchange.sendResponseHeaders(status, -1);
      return;
    }
    exchange.sendResponseHeaders(status, body.length == 0 ? -1 : body.length);
    if (body.length > 0) {
      exchange.getResponseBody().write(body);
    }
  }

  static String contentType(String file) {
    var dot = file.lastIndexOf('.');
    var extension = dot < 0 ? "" : file.substring(dot + 1).toLowerCase(Locale.ROOT);
    return CONTENT_TYPES.getOrDefault(extension, "application/octet-stream");
  }

  private static byte[] bytes(String text) {
    return text.getBytes(StandardCharsets.UTF_8);
  }
}
