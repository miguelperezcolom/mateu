package io.mateu.util;


import com.github.slugify.Slugify;
import com.google.api.client.http.*;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonObjectParser;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.common.base.Charsets;
import com.google.common.base.Strings;
import com.google.common.hash.Hashing;
import com.google.common.io.Files;
import io.mateu.mdd.shared.AppConfigLocator;
import io.mateu.mdd.shared.IAppConfig;
import io.mateu.mdd.shared.SlimHelper;
import io.mateu.util.xml.XMLSerializable;
import lombok.extern.slf4j.Slf4j;
import org.jdom2.Element;
import org.jdom2.output.Format;
import org.jdom2.output.XMLOutputter;

import javax.script.ScriptContext;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;
import java.io.*;
import java.net.URL;
import java.nio.charset.Charset;
import java.text.DecimalFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static java.time.temporal.ChronoUnit.DAYS;

/**
 * Created by miguel on 13/9/16.
 */
@Slf4j
public class Helper extends SlimHelper {

    private static ScriptEngineManager scriptEngineManager;



    static {
        SharedHelper.loadProperties();
        scriptEngineManager = new ScriptEngineManager(ClassLoader.getSystemClassLoader());
    }

    static final HttpTransport HTTP_TRANSPORT = new NetHttpTransport();
    static final com.google.api.client.json.JsonFactory JSON_FACTORY = new JacksonFactory();



    public static LocalDate toDate(int n) {
        return LocalDate.of((n - n % 10000) / 10000, ((n % 10000) - n % 100) / 100, n % 100);
    }

    public static int toInt(LocalDate n) {
        return n.getDayOfMonth() + n.getMonthValue() * 100 + n.getYear() * 10000;
    }

    public static long dias(LocalDate start, LocalDate end) {
        return DAYS.between(start, end);
    }

    public static long noches(LocalDate start, LocalDate end) {
        return DAYS.between(start, end) - 1;
    }

    public static boolean intersects(LocalDate start, LocalDate end, LocalDate checkIn, LocalDate checkOut) {
        return (start == null || start.isBefore(checkOut)) && (end == null || end.compareTo(checkIn) >= 0);
    }

    public static boolean cabe(LocalDate validFrom, LocalDate validTo, LocalDate checkIn, LocalDate checkOut) {
        return validFrom.compareTo(checkIn) <= 0 && validTo.compareTo(checkOut) >= 0;
    }

    public static Map<String, Object> fromJson(String json) throws IOException {
        return Serializer.fromJson(json);
    }

    public static <T> T fromJson(String json, Class<T> c) throws Exception {
        return Serializer.fromJson(json, c);
    }

    public static String toJson(Object o) throws Exception {
        return Serializer.toJson(o);
    }






    public static Map<String, Object> fromYaml(String yaml) throws IOException {
        return Serializer.fromYaml(yaml);
    }

    public static <T> T fromYaml(String yaml, Class<T> c) throws IOException {
        return Serializer.fromYaml(yaml, c);
    }

    public static String toYaml(Object o) throws IOException {
        return Serializer.toYaml(o);
    }









    public static String md5(String s) {
        return Hashing.sha256().newHasher().putString(s, Charsets.UTF_8).hash().toString();
    }


    public static URL whichJar(Class c) {
        return c.getProtectionDomain().getCodeSource().getLocation();
    }

    public static double roundEuros(double value) {
        return Math.round(value * 100d) / 100d;
    }

    public static String formatEuros(double value) {
        return new DecimalFormat("##,###,###,###,###,###.00").format(value);
    }


    public static String httpGet(String url) throws IOException {
        log.debug("HTTP GET " + url);
        HttpRequestFactory requestFactory =
                HTTP_TRANSPORT.createRequestFactory(new HttpRequestInitializer() {
                    @Override
                    public void initialize(HttpRequest request) {
                        request.setParser(new JsonObjectParser(JSON_FACTORY));
                    }
                });
        HttpRequest request = requestFactory.buildGetRequest(new GenericUrl(url));
        return request.execute().parseAsString(); //.parseAs(VideoFeed.class);
    }

    public static String httpPost(String url, Map<String, String> parameters) throws IOException {
        log.debug("HTTP POST " + url);
        HttpRequestFactory requestFactory =
                HTTP_TRANSPORT.createRequestFactory(new HttpRequestInitializer() {
                    @Override
                    public void initialize(HttpRequest request) {
                        request.setParser(new JsonObjectParser(JSON_FACTORY));
                    }
                });



        HttpRequest request = requestFactory.buildPostRequest(new GenericUrl(url), new UrlEncodedContent(""));
        return request.execute().parseAsString(); //.parseAs(VideoFeed.class);
    }

    public static int max(int... values) {
        int max = Integer.MIN_VALUE;
        for (int value : values) if (value > max) max = value;
        return max;
    }

    public static LocalDateTime toLocalDateTime(Date date) {
        Calendar c = Calendar.getInstance();
        c.setTime(date);
        return LocalDateTime.of(c.get(Calendar.YEAR), c.get(Calendar.MONTH) + 1, c.get(Calendar.DAY_OF_MONTH), c.get(Calendar.HOUR_OF_DAY), c.get(Calendar.MINUTE), c.get(Calendar.SECOND));
    }

    public static LocalDate toLocalDate(Date date) {
        Calendar c = Calendar.getInstance();
        c.setTime(date);
        return LocalDate.of(c.get(Calendar.YEAR), c.get(Calendar.MONTH) + 1, c.get(Calendar.DAY_OF_MONTH));
    }

    public static Map<String,Object> hashmap(Object... args) {
        Map<String,Object> m = new HashMap<>();
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

    public static double roundOffEuros(double v) {
        return Math.round(100d * v) / 100d;
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

    public static int[] toIntArray(String s) {
        if (s == null) return null;
        if ("".equals(s.trim())) return new int[0];
        String[] ts = s.replace("[", "").replace("]", "").split(",");
        int[] r = new int[ts.length];
        for (int pos = 0; pos < ts.length; pos++) {
            r[pos] = Integer.parseInt(ts[pos]);
        }
        return r;
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

    public static String leerInputStream(InputStream is, String encoding) {
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

    public static String leerFichero(InputStream input, String codificacion) {

        String s = "";

        ByteArrayOutputStream output = new ByteArrayOutputStream();

        byte[] buffer = new byte[1024];
        long count = 0;
        int n = 0;
        try {
            while (-1 != (n = input.read(buffer))) {
                output.write(buffer, 0, n);
                count += n;
            }
            s = new String(output.toByteArray(), codificacion);
        } catch (IOException e) {
            e.printStackTrace();
        }
        return s;
    }


    public static String leerFichero(InputStream is) throws IOException {

        int count;
        byte[] data = new byte[BUFFER];
        ByteArrayOutputStream dest = new ByteArrayOutputStream();
        while ((count = is.read(data, 0, BUFFER))
                != -1) {
            dest.write(data, 0, count);
        }
        dest.flush();
        dest.close();

        return new String(dest.toByteArray());
    }

    public static String leerFichero(String fn, String encoding) {
        String s = "";
        byte[] buffer = new byte[(int) new File(fn).length()];
        BufferedInputStream f;
        try {
            f = new BufferedInputStream(new FileInputStream(fn));
            f.read(buffer);
            f.close();
            s = new String(buffer, encoding);
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return s;
    }

    public static String leerFichero(String fn) {
        String s = "";
        byte[] buffer = new byte[(int) new File(fn).length()];
        try (BufferedInputStream f = new BufferedInputStream(new FileInputStream(fn))) {
            f.read(buffer);
            f.close();
            s = new String(buffer);
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return s;
    }

    public static void escribirFichero(String fn, byte[] bytes) throws IOException {
        File f = new File(fn);
        Files.write(bytes, f);
    }

    public static void escribirFichero(String fn, String txt) throws IOException {
        escribirFichero(fn, txt.getBytes());
    }


    private static final int BUFFER = 2048;
    public static byte[] leerByteArray(InputStream is) {
        int count;
        byte[] data = new byte[BUFFER];
        // write the files to the disk
        ByteArrayOutputStream dest = new ByteArrayOutputStream();
        try {
            while ((count = is.read(data, 0, BUFFER))
                    != -1) {
                dest.write(data, 0, count);
            }
            dest.flush();
            dest.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return dest.toByteArray();
    }

    public static double toDouble(String s) {
        double v = 0;
        try {
            v = Double.parseDouble(s);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return v;
    }

    public static Map<String,String> parseQueryString(String query) {
        Map<String,String> params = new HashMap<>();

        if (!Strings.isNullOrEmpty(query)) {

            for (String t : query.split("&")) if (!Strings.isNullOrEmpty(t)) {
                String[] q = t.split("=");
                params.put(q[0], (q.length > 1)?q[1]:null);
            }

        }


        return params;
    }


    public static String runCommand(String command) throws IOException, InterruptedException {

        String homeDirectory = System.getProperty("user.home");

        String[] cmd = { "/bin/sh", "-c", command };
        String[] wcmd = { "cmd", "/c", command };
        Process process = Runtime.getRuntime().exec(System.getProperty("os.name").toLowerCase().contains("win")?wcmd:cmd);
        String r = Helper.leerInputStream(process.getInputStream(), "utf-8");
        String e = Helper.leerInputStream(process.getErrorStream(), "utf-8");

        int exitCode = process.waitFor();

        return r + e;
    }

    public static String toHtml(String s) {
        if (!Strings.isNullOrEmpty(s)) return s.replaceAll("\\\n", "<br/>");
        else return s;
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


    public static <T> T getImpl(Class<T> c) throws Exception {
       return SharedHelper.getImpl(c);
    }

    public static <T> List<T> getImpls(Class<T> c) throws Exception {
        return SharedHelper.getImpls(c);
    }

    public static Map<String, Object> getGeneralData() throws Throwable {
        Map<String, Object> data = new HashMap<>();

        IAppConfig c = Helper.getImpl(AppConfigLocator.class).get();
        data.put("businessname", c.getBusinessName());
        String l = c.getLogoUrl();
        if (!Strings.isNullOrEmpty(l)) data.put("logourl", l);

        return data;
    }


    public static void main(String[] args) {
        try {
            log.debug(Helper.toJson(Helper.fromYaml(Files.toString(new File("/home/miguel/work/initialdata.yml"), Charset.defaultCharset()))));

            Map<String, Object> o = Helper.fromYaml(Files.toString(new File("/home/miguel/work/initialdata.yml"), Charset.defaultCharset()));


            log.debug("" + Helper.get(o, "smtp/host"));


        } catch (Exception e) {
            e.printStackTrace();
        }
    }



    public static String toString(Element element) {
        if (element == null) return "";
        else return new XMLOutputter(Format.getPrettyFormat()).outputString(element);
    }

    public static boolean areXmlSerializableEqual(XMLSerializable a, XMLSerializable b) {
        return a == b || (b != null && Helper.toString(a.toXml()).equals(Helper.toString((b.toXml()))));
    }


    public static boolean equals(Object a, Object b) {
        if (a == b) return true;
        else if (a == null && b != null) return false;
        else if (a != null && b == null) return false;
        else return a.equals(b);
    }

    public static String eval(String operations) {
        return eval("nashorn", operations, null);
    }

    public static String eval(String engineName, String operations, Map<String, Object> params) {

        long t0 = System.currentTimeMillis();

        /*
        // Get the list of all available engines
        List<ScriptEngineFactory> list = manager.getEngineFactories();

        // Print the details of each engine
        for (ScriptEngineFactory f : list) {
            log.info("Engine Name:" + f.getEngineName());
            log.info("Engine Version:" + f.getEngineVersion());
            log.info("Language Name:" + f.getLanguageName());
            log.info("Language Version:" + f.getLanguageVersion());
            log.info("Engine Short Names:" + f.getNames());
            log.info("Mime Types:" + f.getMimeTypes());
            log.info("===");
        }
         */
        
        ScriptEngine engine = scriptEngineManager.getEngineByName(engineName);
        //log.info("engine.eval('" + operations + "') instantiating engine took " + (System.currentTimeMillis() - t0) + "ms");

        ScriptContext context = engine.getContext();
        if (params != null) params.forEach((k,v) -> engine.put(k, v));
        StringWriter writer = new StringWriter();
        context.setWriter(writer);

        long t1 = System.currentTimeMillis();
        try {
            writer.append("" + engine.eval(operations));
        } catch (ScriptException e) {
            writer.append(e.getMessage());
        }
        //log.info("engine.eval('" + operations + "') took " + (System.currentTimeMillis() - t1) + "ms");

        String output = writer.toString();

        //log.info("eval('" + operations + "') took " + (System.currentTimeMillis() - t0) + "ms");
        return output;
    }



    public static String encodeState(String s) {
        return s.replaceAll("/", "YP9LKQ");
    }

    public static String toString(Throwable e) {
        StringWriter sw;
        PrintWriter pw = new PrintWriter(sw = new StringWriter());
        e.printStackTrace(pw);
        pw.close();
        return sw.toString();
    }

    public static String urlize(String s) {
        return new Slugify().slugify(s);
    }

}
