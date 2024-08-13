package io.mateu.core.domain.uidefinition.shared.data;

import com.google.common.io.Files;
import com.google.common.io.Resources;
import java.io.*;
import java.net.URL;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class DataHelper {

  public static boolean isEmpty(String s) {
    return s == null || "".equals(s.trim());
  }

  public static String read(InputStream is) {
    return read(is, "utf-8");
  }

  private static String read(InputStream is, String encoding) {
    StringBuffer s = new StringBuffer();
    try {
      BufferedReader br = new BufferedReader(new InputStreamReader(is, encoding));
      String l = null;
      boolean primeraLinea = true;
      while ((l = br.readLine()) != null) {
        if (primeraLinea) {
          primeraLinea = false;
        } else {
          s.append("\n");
        }
        s.append(l);
      }
    } catch (FileNotFoundException e) {
      e.printStackTrace();
    } catch (IOException e) {
      e.printStackTrace();
    }
    return s.toString();
  }

  public static void write(String fn, byte[] bytes) {
    File f = new File(fn);
    write(f, bytes);
  }

  public static void write(File f, byte[] bytes) {
    log.info("writing " + f.getAbsolutePath());
    try (FileOutputStream w = new FileOutputStream(f)) {
      if (!f.getParentFile().exists()) {
        boolean dirsCreated = f.getParentFile().mkdirs();
        if (!dirsCreated) {
          throw new IOException("could not create directory " + f.getParentFile());
        }
      }
      w.write(bytes);
    } catch (IOException e) {
      log.error("When writing file", e);
    }
  }

  public static byte[] readBytes(String fn) throws IOException {
    return readBytes(new File(fn));
  }

  public static byte[] readBytes(File f) throws IOException {
    log.info("reading " + f.getAbsolutePath());
    return Files.asByteSource(f).read();
  }

  public static byte[] readBytes(URL url) throws IOException {
    return Resources.asByteSource(url).read();
  }
}
