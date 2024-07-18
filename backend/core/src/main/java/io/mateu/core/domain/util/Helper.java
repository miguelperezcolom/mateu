package io.mateu.core.domain.util;

import io.mateu.core.domain.uidefinition.shared.SlimHelper;
import java.io.*;
import java.util.HashMap;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.jdom2.Element;
import org.jdom2.output.Format;
import org.jdom2.output.XMLOutputter;

/** Created by miguel on 13/9/16. */
@Slf4j
public class Helper extends SlimHelper {

  static {
    SharedHelper.loadProperties();
  }

  public static int max(int... values) {
    int max = Integer.MIN_VALUE;
    for (int value : values) if (value > max) max = value;
    return max;
  }

  public static Map<String, Object> hashmap(Object... args) {
    Map<String, Object> m = new HashMap<>();
    int pos = 0;
    Object o0 = null;
    for (Object o : args) {
      if (pos > 0 && pos % 2 == 1) {
        m.put("" + o0, o);
      } else {
        o0 = o;
      }
      pos++;
    }
    return m;
  }

  public static int toInt(String s) {
    int v = 0;
    try {
      v = Integer.parseInt(s);
    } catch (Exception e) {
      e.printStackTrace();
    }
    return v;
  }

  public static String leerFichero(Class c, String p) {

    String s = "";

    InputStream input = c.getResourceAsStream(p);
    ByteArrayOutputStream output = new ByteArrayOutputStream();

    byte[] buffer = new byte[1024];
    long count = 0;
    int n = 0;
    try {
      while (-1 != (n = input.read(buffer))) {
        output.write(buffer, 0, n);
        count += n;
      }
      s = new String(output.toByteArray());
    } catch (IOException e) {
      e.printStackTrace();
    }
    return s;
  }

  public static String leerFichero(InputStream is) throws IOException {

    int count;
    byte[] data = new byte[BUFFER];
    ByteArrayOutputStream dest = new ByteArrayOutputStream();
    while ((count = is.read(data, 0, BUFFER)) != -1) {
      dest.write(data, 0, count);
    }
    dest.flush();
    dest.close();

    return new String(dest.toByteArray());
  }

  private static final int BUFFER = 2048;

  public static double toDouble(String s) {
    double v = 0;
    try {
      v = Double.parseDouble(s);
    } catch (Exception e) {
      e.printStackTrace();
    }
    return v;
  }

  public static Object get(Map<String, Object> data, String key) {
    return get(data, key, null);
  }

  public static Object get(Map<String, Object> data, String key, Object defaultValue) {
    if (data == null) {
      return defaultValue;
    } else {
      Object v = defaultValue;

      Map<String, Object> d = data;

      String[] ks = key.split("/");
      int pos = 0;
      for (String k : ks) {
        if (d.containsKey(k)) {
          if (pos == ks.length - 1) {
            v = d.get(k);
          } else {
            Object aux = d.get(k);
            if (aux instanceof Map) {
              d = (Map<String, Object>) aux;
              pos++;
            } else break;
          }
        } else break;
      }

      return v;
    }
  }

  public static String toString(Element element) {
    if (element == null) return "";
    else return new XMLOutputter(Format.getPrettyFormat()).outputString(element);
  }

  public static boolean equals(Object a, Object b) {
    if (a == b) return true;
    else if (a == null && b != null) return false;
    else if (a != null && b == null) return false;
    else return a.equals(b);
  }

  public static String toString(Throwable e) {
    StringWriter sw;
    PrintWriter pw = new PrintWriter(sw = new StringWriter());
    e.printStackTrace(pw);
    pw.close();
    return sw.toString();
  }
}
