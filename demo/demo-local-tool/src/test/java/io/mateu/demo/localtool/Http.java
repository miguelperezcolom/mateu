package io.mateu.demo.localtool;

import java.io.IOException;
import java.io.InputStream;
import java.net.Socket;
import java.nio.charset.StandardCharsets;

/**
 * A raw HTTP/1.1 client: the tests must send any Host header they like, which {@code
 * java.net.http.HttpClient} refuses to do.
 */
record Http(int port) {

  record Response(int status, String headers, String body) {
    String header(String name) {
      return headers
          .lines()
          .filter(l -> l.toLowerCase().startsWith(name.toLowerCase() + ":"))
          .map(l -> l.substring(l.indexOf(':') + 1).trim())
          .findFirst()
          .orElse(null);
    }
  }

  Response get(String path, String host, String cookie) throws IOException {
    return send("GET", path, host, cookie, null);
  }

  Response post(String path, String host, String cookie, String json) throws IOException {
    return send("POST", path, host, cookie, json);
  }

  String loopback() {
    return "127.0.0.1:" + port;
  }

  private Response send(String method, String path, String host, String cookie, String json)
      throws IOException {
    try (var socket = new Socket("127.0.0.1", port)) {
      var body = json == null ? new byte[0] : json.getBytes(StandardCharsets.UTF_8);
      var request = new StringBuilder();
      request.append(method).append(' ').append(path).append(" HTTP/1.1\r\n");
      request.append("Host: ").append(host).append("\r\n");
      if (cookie != null) {
        request.append("Cookie: ").append(cookie).append("\r\n");
      }
      if (json != null) {
        request.append("Content-Type: application/json\r\n");
      }
      request.append("Content-Length: ").append(body.length).append("\r\n");
      request.append("Connection: close\r\n\r\n");
      var out = socket.getOutputStream();
      out.write(request.toString().getBytes(StandardCharsets.US_ASCII));
      out.write(body);
      out.flush();
      var raw = new String(readAll(socket.getInputStream()), StandardCharsets.UTF_8);
      var split = raw.indexOf("\r\n\r\n");
      var head = split < 0 ? raw : raw.substring(0, split);
      var status = Integer.parseInt(head.split(" ")[1]);
      return new Response(status, head, split < 0 ? "" : raw.substring(split + 4));
    }
  }

  private static byte[] readAll(InputStream in) throws IOException {
    return in.readAllBytes();
  }
}
