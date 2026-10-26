package io.mateu.maven.bundle;

import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

/**
 * "Same project on web and phone": what the {@code dev} goal prints so the UI it serves opens in
 * the Mateu app (the React Native renderer) as well as in a browser. A static bundle IS a UI the
 * app can add — the app reads its {@code mateu/v3/manifest} file and runs from its {@code
 * manifest.json} — so all a phone needs is an address it can reach and a link that carries it:
 *
 * <ul>
 *   <li>bound to the loopback interface (the default), only this machine reaches it: an iOS
 *       simulator at {@code localhost}, an Android emulator at {@code 10.0.2.2} (the emulator's
 *       alias for the host);
 *   <li>bound to every interface ({@code -Dmateu.dev.host=0.0.0.0}), a phone on the same network
 *       reaches it at this machine's LAN address, and a QR code on the terminal adds it: the {@code
 *       https://mateu.io/add?u=…} link the Mateu app answers, or — with {@code
 *       -Dmateu.dev.expoUrl=exp://<host>:8081} — the Expo Go link of a renderer you run from
 *       source.
 * </ul>
 */
final class DevPhone {

  /** The Android emulator's address for the machine it runs on. */
  static final String ANDROID_EMULATOR_HOST = "10.0.2.2";

  private DevPhone() {}

  /** Whether {@code host} binds every interface. */
  static boolean isWildcard(String host) {
    return host == null
        || host.isBlank()
        || "0.0.0.0".equals(host)
        || "::".equals(host)
        || "[::]".equals(host)
        || "*".equals(host);
  }

  /** Whether {@code host} is the loopback interface (reachable from this machine only). */
  static boolean isLoopback(String host) {
    if (host == null) {
      return false;
    }
    var h = host.toLowerCase(Locale.ROOT);
    return "localhost".equals(h) || h.startsWith("127.") || "::1".equals(h) || "[::1]".equals(h);
  }

  /**
   * This machine's address on the local network: the first site-local IPv4 address of an interface
   * that is up and is neither loopback nor virtual. Empty when there is none.
   */
  static Optional<String> lanAddress() {
    try {
      var candidates = new ArrayList<String>();
      for (var nic : Collections.list(NetworkInterface.getNetworkInterfaces())) {
        if (!nic.isUp() || nic.isLoopback() || nic.isVirtual() || nic.isPointToPoint()) {
          continue;
        }
        for (InetAddress address : Collections.list(nic.getInetAddresses())) {
          if (address instanceof Inet4Address && address.isSiteLocalAddress()) {
            candidates.add(address.getHostAddress());
          }
        }
      }
      // 192.168.x / 10.x before 172.16–31 (often a container bridge)
      candidates.sort((a, b) -> Boolean.compare(a.startsWith("172."), b.startsWith("172.")));
      return candidates.stream().findFirst();
    } catch (SocketException | RuntimeException e) {
      return Optional.empty();
    }
  }

  /**
   * The link that adds the UI at {@code uiUrl}: Expo Go's when an Expo URL is given, else the
   * app's.
   */
  static String addLink(String uiUrl, String expoUrl) {
    var u = URLEncoder.encode(uiUrl, StandardCharsets.UTF_8);
    if (expoUrl != null && !expoUrl.isBlank()) {
      var base = expoUrl.trim();
      while (base.endsWith("/")) {
        base = base.substring(0, base.length() - 1);
      }
      return base + "/--/add?u=" + u;
    }
    return "https://mateu.io/add?u=" + u;
  }

  /**
   * The lines the goal logs, after the "serving" one.
   *
   * @param lan this machine's LAN address, when there is one
   */
  static List<String> banner(
      String host, int port, String basePath, String expoUrl, boolean qr, Optional<String> lan) {
    var lines = new ArrayList<String>();
    var path = (basePath == null ? "" : basePath) + "/";
    if (isLoopback(host)) {
      lines.add(
          "mateu-dev: in the Mateu app — iOS simulator: http://localhost:"
              + port
              + path
              + " · Android emulator: http://"
              + ANDROID_EMULATOR_HOST
              + ":"
              + port
              + path
              + " · a phone: add -Dmateu.dev.host=0.0.0.0");
      return lines;
    }
    var reachable = isWildcard(host) ? lan.orElse(null) : host;
    if (reachable == null) {
      lines.add(
          "mateu-dev: no LAN address found — a phone cannot reach this machine; the simulators"
              + " can (http://localhost:"
              + port
              + path
              + ", Android emulator http://"
              + ANDROID_EMULATOR_HOST
              + ":"
              + port
              + path
              + ")");
      return lines;
    }
    var ui =
        "http://"
            + (reachable.contains(":") ? "[" + reachable + "]" : reachable)
            + ":"
            + port
            + path;
    var uiBase = ui.substring(0, ui.length() - 1);
    var link = addLink(uiBase, expoUrl);
    lines.add("mateu-dev: on a phone on the same network: " + ui);
    lines.add(
        "mateu-dev: "
            + (expoUrl != null && !expoUrl.isBlank()
                ? "scan with the phone's camera to open it in Expo Go: "
                : "scan with the phone's camera to add it to the Mateu app (a development build —"
                    + " a store build accepts https only): ")
            + link);
    if (qr) {
      lines.add("\n" + QrCode.encode(link, QrCode.Ecc.M).toTerminal(2));
    }
    return lines;
  }
}
