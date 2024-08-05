package io.mateu.core.infra;

import java.awt.*;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;

public class Utils {

  public static void exit(int status) {
    new Thread(
            () -> {
              try {
                Thread.sleep(100);
              } catch (InterruptedException e) {
                throw new RuntimeException(e);
              }
              System.exit(status);
            })
        .start();
  }

  public static void browse(String url) {
    if (Desktop.isDesktopSupported()) {
      try {
        URI homepage = new URI(url);
        Desktop.getDesktop().browse(homepage);
      } catch (URISyntaxException | IOException e) {
        e.printStackTrace();
      }
    } else {
      Runtime runtime = Runtime.getRuntime();
      try {
        runtime.exec("open %s".formatted(url));
      } catch (IOException e) {
        e.printStackTrace();
      }
    }
  }
}
