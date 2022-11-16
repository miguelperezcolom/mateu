package io.mateu.util.common;

import com.google.common.io.Files;
import com.google.common.io.Resources;
import lombok.extern.slf4j.Slf4j;

import java.io.*;
import java.net.URL;

/**
 * Created by miguel on 7/1/17.
 */
@Slf4j
public class Utils {

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
        log.debug("writing " + f.getAbsolutePath());
        FileOutputStream w;
        try {
            if (!f.getParentFile().exists()) f.getParentFile().mkdirs();
            w = new FileOutputStream(f);
            w.write(bytes);
            w.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static byte[] readBytes(String fn) throws IOException {
        return readBytes(new File(fn));
    }

    public static byte[] readBytes(File f) throws IOException {
        log.debug("reading " + f.getAbsolutePath());
        return Files.asByteSource(f).read();
    }

    public static byte[] readBytes(URL url) throws IOException {
        return Resources.asByteSource(url).read();
    }
}
