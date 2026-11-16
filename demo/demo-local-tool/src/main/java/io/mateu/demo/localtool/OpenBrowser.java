package io.mateu.demo.localtool;

import io.mateu.demo.localtool.hardening.LaunchToken;
import java.awt.Desktop;
import java.awt.GraphicsEnvironment;
import java.net.URI;
import java.util.Locale;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.server.context.WebServerInitializedEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

/**
 * Once the server listens (on a free port: {@code server.port=0}), print its address and open the
 * default browser there. Never fails: on a headless machine (ssh, CI) it only prints the address.
 */
@Component
public class OpenBrowser implements ApplicationListener<WebServerInitializedEvent> {

  private final boolean open;
  private final ObjectProvider<LaunchToken> token;

  public OpenBrowser(
      @Value("${local-tool.open-browser:true}") boolean open, ObjectProvider<LaunchToken> token) {
    this.open = open;
    this.token = token;
  }

  @Override
  public void onApplicationEvent(WebServerInitializedEvent event) {
    var url = "http://127.0.0.1:" + event.getWebServer().getPort() + "/";
    var launchToken = token.getIfAvailable();
    if (launchToken != null) {
      url += "?t=" + launchToken.value(); // hardening: see LaunchToken
    }
    System.out.println();
    System.out.println("  Local tool running at " + url);
    System.out.println("  Press Ctrl+C or use Quit in the page to stop it.");
    System.out.println();
    if (open) {
      browse(url);
    }
  }

  static void browse(String url) {
    try {
      if (!GraphicsEnvironment.isHeadless()
          && Desktop.isDesktopSupported()
          && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
        Desktop.getDesktop().browse(URI.create(url));
        return;
      }
      var os = System.getProperty("os.name", "").toLowerCase(Locale.ROOT);
      String[] command =
          os.contains("mac")
              ? new String[] {"open", url}
              : os.contains("win")
                  ? new String[] {"rundll32", "url.dll,FileProtocolHandler", url}
                  : new String[] {"xdg-open", url};
      new ProcessBuilder(command).inheritIO().start();
    } catch (Exception | Error e) {
      System.out.println("  (Could not open a browser: open the address above yourself.)");
    }
  }
}
