package io.mateu.core.infra;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.charset.Charset;
import lombok.extern.slf4j.Slf4j;

/** Created by miguel on 13/9/16. */
@Slf4j
public final class InputStreamReader {

  private InputStreamReader() {}

  public static String readFromClasspath(Class c, String p) {
    String s = "";

    InputStream inputStream = c.getResourceAsStream(p);
    if (inputStream == null) {
      throw new RuntimeException("Resource not found: " + p);
    }
    return readInputStream(inputStream);
  }

  public static String readInputStream(InputStream is) {

    int count;
    byte[] data = new byte[BUFFER];
    ByteArrayOutputStream dest = new ByteArrayOutputStream();
    try {
      while ((count = is.read(data, 0, BUFFER)) != -1) {
        dest.write(data, 0, count);
      }
      dest.flush();
      dest.close();
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }

    return new String(dest.toByteArray(), Charset.defaultCharset());
  }

  private static final int BUFFER = 2048;
}
