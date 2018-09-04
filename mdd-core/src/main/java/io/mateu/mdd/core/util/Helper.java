package io.mateu.mdd.core.util;


import com.Ostermiller.util.CSVParser;
import com.Ostermiller.util.CSVPrinter;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import com.google.api.client.http.*;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonObjectParser;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.common.base.Charsets;
import com.google.common.base.Strings;
import com.google.common.collect.Maps;
import com.google.common.hash.Hashing;
import com.google.common.io.Files;
import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import freemarker.template.TemplateExceptionHandler;
import io.mateu.mdd.core.asciiart.Painter;
import io.mateu.mdd.core.interfaces.RpcView;
import io.mateu.mdd.core.model.config.AppConfig;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.MiURLConverter;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.workflow.WorkflowEngine;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.ListViewComponent;
import org.apache.commons.beanutils.ConvertUtils;
import org.apache.commons.mail.DefaultAuthenticator;
import org.apache.commons.mail.EmailException;
import org.apache.commons.mail.HtmlEmail;
import org.apache.fop.apps.*;
import org.apache.poi.hssf.usermodel.HSSFDateUtil;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.jdom2.Document;
import org.jdom2.Element;
import org.jdom2.JDOMException;
import org.jdom2.input.SAXBuilder;
import org.jdom2.output.Format;
import org.jdom2.output.XMLOutputter;
import org.xml.sax.SAXException;

import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMultipart;
import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;
import javax.persistence.Query;
import javax.sql.DataSource;
import javax.validation.ConstraintViolation;
import javax.validation.ConstraintViolationException;
import javax.xml.transform.*;
import javax.xml.transform.sax.SAXResult;
import javax.xml.transform.stream.StreamSource;
import java.io.*;
import java.lang.reflect.InvocationTargetException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.charset.Charset;
import java.text.DecimalFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Created by miguel on 13/9/16.
 */
public class Helper {

    public static boolean propertiesLoaded = false;

    static {
        loadProperties();
    }

    static final HttpTransport HTTP_TRANSPORT = new NetHttpTransport();
    static final com.google.api.client.json.JsonFactory JSON_FACTORY = new JacksonFactory();


    private static DataSource dataSource;
    private static Map<String, EntityManagerFactory> emf = new HashMap<>();

    private static ThreadLocal<EntityManager> tlem = new ThreadLocal<>();

    private static ObjectMapper mapper = new ObjectMapper();
    private static ObjectMapper yamlMapper = new ObjectMapper(new YAMLFactory());

    static {
        mapper.enable(SerializationFeature.INDENT_OUTPUT);
        yamlMapper.enable(SerializationFeature.INDENT_OUTPUT);
    }

    // Create your Configuration instance, and specify if up to what FreeMarker
// version (here 2.3.25) do you want to apply the fixes that are not 100%
// backward-compatible. See the Configuration JavaDoc for details.
    private static Configuration cfg = new Configuration(Configuration.VERSION_2_3_25);

    {
// Specify the source where the template files come from. Here I set a
// plain directory for it, but non-file-system sources are possible too:
        try {
            cfg.setDirectoryForTemplateLoading(new File(""));
        } catch (IOException e) {
            e.printStackTrace();
        }

// Set the preferred charset template files are stored in. UTF-8 is
// a good choice in most applications:
        cfg.setDefaultEncoding("UTF-8");

// Sets how errors will appear.
// During web page *development* TemplateExceptionHandler.HTML_DEBUG_HANDLER is better.
        cfg.setTemplateExceptionHandler(TemplateExceptionHandler.RETHROW_HANDLER);

// Don't log exceptions inside FreeMarker that it will thrown at you anyway:
        cfg.setLogTemplateExceptions(false);
    }







    public static Map<String, Object> fromJson(String json) throws IOException {
        if (json == null || "".equals(json)) json = "{}";
        return mapper.readValue(json, Map.class);
    }

    public static <T> T fromJson(String json, Class<T> c) throws IOException {
        if (json == null || "".equals(json)) json = "{}";
        return mapper.readValue(json, c);
    }

    public static String toJson(Object o) throws IOException {
        return mapper.writeValueAsString(o);
    }






    public static Map<String, Object> fromYaml(String yaml) throws IOException {
        if (yaml == null) yaml = "";
        return yamlMapper.readValue(yaml, Map.class);
    }

    public static <T> T fromYaml(String yaml, Class<T> c) throws IOException {
        if (yaml == null) yaml = "";
        return yamlMapper.readValue(yaml, c);
    }

    public static String toYaml(Object o) throws IOException {
        return yamlMapper.writeValueAsString(o);
    }








    public static EntityManager getEMFromThreadLocal() {
        return tlem.get();
    }



    public static void transact(JPATransaction t) throws Throwable {
        transact(System.getProperty("defaultpuname", "default"), t);
    }

    public static void transact(String persistenceUnit, JPATransaction t) throws Throwable {

        EntityManager em = getEMF().createEntityManager();

        try {

            em.getTransaction().begin();

            tlem.set(em);

            WorkflowEngine.activateLocalRunner();

            t.run(em);

            System.out.println("commit");

            em.getTransaction().commit();

            System.out.println("commited");

            WorkflowEngine.runAndWaitThreadLocalTasks();

        } catch (ConstraintViolationException e) {
            e.printStackTrace();
            StringBuffer sb = new StringBuffer();
            for (ConstraintViolation v : e.getConstraintViolations()) {
                if (sb.length() > 0) sb.append("\n");
                sb.append("" + v.getPropertyPath() + " " + v.getMessage());
            }
            System.out.println(sb.toString());
            if (em.getTransaction().isActive()) em.getTransaction().rollback();
            em.close();
            throw new Exception(sb.toString());
        } catch (Exception e) {

            if (e.getCause() != null && e.getCause() instanceof ConstraintViolationException) {
                ConstraintViolationException cve = (ConstraintViolationException) e.getCause();
                StringBuffer sb = new StringBuffer();
                for (ConstraintViolation v : cve.getConstraintViolations()) {
                    if (sb.length() > 0) sb.append("\n");
                    sb.append(v.getMessage());
                }
                System.out.println(sb.toString());
                if (em.getTransaction().isActive()) em.getTransaction().rollback();
                em.close();
                throw new Exception(sb.toString());
            } else {
                e.printStackTrace();
                if (em.getTransaction().isActive()) em.getTransaction().rollback();
                em.close();
                throw e;
            }

        }

        em.close();

        System.out.println("em cerrado");

    }

    private static EntityManagerFactory getEMF() {
        return getEMF(System.getProperty("defaultpuname", "default"));
    }

    private static EntityManagerFactory getEMF(String persistenceUnit) {
        EntityManagerFactory v;
        if ((v = emf.get(persistenceUnit)) == null) {
            emf.put(persistenceUnit, v = Persistence.createEntityManagerFactory(persistenceUnit, System.getProperties()));
        }
        return v;
    }

    public static void notransact(JPATransaction t) throws Throwable {

        EntityManager em = getEMF().createEntityManager();

        try {

            t.run(em);

        } catch (Exception e) {
            e.printStackTrace();
            em.close();
            throw e;
        }

        em.close();

    }


    public static List<Object> selectObjects(String jpql) throws Throwable {
        List<Object> l = new ArrayList<>();

        Helper.notransact(em -> {

            l.addAll(em.createQuery(jpql).getResultList());

        });

        return l;
    }


    //todo: sql nativo
    public static List<Object[]> sqlSelectPage(String jpql, int offset, int limit) throws Throwable {
        List<Object[]> list = new ArrayList<>();

        Helper.notransact(em -> {

            Query q = em.createQuery(jpql);

            q.setFirstResult(offset);
            q.setMaxResults(limit);


            list.addAll(q.getResultList());

        });

        return list;
    }

    //todo: sql nativo
    public static int sqlCount(String sql) throws Throwable {
        int[] count = {0};

        Helper.notransact(em -> {

            String countjpql = "select count(*) from (" + sql + ") xxx";

            count[0] = ((Long)em.createQuery(countjpql).getSingleResult()).intValue();


        });

        return count[0];
    }



    public static String md5(String s) {
        return Hashing.sha256().newHasher().putString(s, Charsets.UTF_8).hash().toString();
    }

    public static void setDataSource(DataSource dataSource) {
        Helper.dataSource = dataSource;
    }


    public static void touch(Object o, EntityManager em, String login) {

    }

    public static String freemark(String freemarker, Map<String, Object> root) throws IOException, TemplateException {

        long t0 = new Date().getTime();

        //Template temp = cfg.getTemplate("test.ftlh");

        Template temp = new Template("name", new StringReader(freemarker),
                new Configuration());

        /*
        StringTemplateLoader stringLoader = new StringTemplateLoader();
        stringLoader.putTemplate("greetTemplate", "<#macro greet>Hello</#macro>");
        stringLoader.putTemplate("myTemplate", "<#include \"greetTemplate\"><@greet/> World!");
        cfg.setTemplateLoader(stringLoader);
        */

        StringWriter out = new StringWriter(); //new OutputStreamWriter(System.out);
        temp.process(root, out);

        System.out.println("freemarker template compiled and applied in " + (new Date().getTime() - t0) + " ms.");

        return out.toString();
    }

    public static URL whichJar(Class c) {
        return c.getProtectionDomain().getCodeSource().getLocation();
    }

    public static double roundEuros(double value) {
        return Math.round(value * 100d) / 100d;
    }

    public static String capitalize(String s) {
        if (s == null || "".equals(s)) return s;
        s = s.replaceAll("\\.", " ");
        String c = s.replaceAll(
                String.format("%s|%s|%s",
                        "(?<=[A-Z])(?=[A-Z][a-z])",
                        "(?<=[^A-Z])(?=[A-Z])",
                        "(?<=[A-Za-z])(?=[^A-Za-z])"
                ),
                " "
        ).toLowerCase();
        c = c.replaceAll("[ ]+", " ");
        if (c.length() > 1) c = c.substring(0, 1).toUpperCase() + c.substring(1);

        return c;
    }

    public static String pluralize(String s) {
        if (s == null || "".equals(s)) return s;
        if (s.endsWith("s")) s += "es";
        else s += "s";
        if (s.endsWith("ys")) s = s.replaceAll("ys$", "ies") ;
        return s;
    }

    public static String httpGet(String url) throws IOException {
        System.out.println("HTTP GET " + url);
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
        System.out.println("HTTP POST " + url);
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

    public static Object[][][] parseExcel(File f) throws IOException, InvalidFormatException {

        List<Object[][]> l0 = new ArrayList<Object[][]>();


        Workbook wb = WorkbookFactory.create(f);

        return readExcel(wb);
    }

    public static Object[][][] readExcel(Workbook wb) throws IOException, InvalidFormatException {


        List<Object[][]> l0 = new ArrayList<Object[][]>();

        for (int poshoja = 0; poshoja < wb.getNumberOfSheets(); poshoja++) {
            List<Object[]> l1 = new ArrayList<Object[]>();
            Sheet sheet = wb.getSheetAt(poshoja);
            if (sheet != null) for (int posfila = 0; posfila <= sheet.getLastRowNum(); posfila++) {
                List<Object> l2 = new ArrayList<Object>();
                Row row = sheet.getRow(posfila);
                if (row != null) {
                    int nrCol = row.getLastCellNum();
                    for (int poscol = 0; poscol < nrCol; poscol++) {
                        Cell cell = row.getCell(poscol);
                        Object v = null;
                        if (cell != null) {

                            System.out.println(cell.getCellTypeEnum());
                            System.out.println(cell.toString());

                            switch (cell.getCellTypeEnum()) {
                                case BLANK: break;
                                case BOOLEAN: v = cell.getBooleanCellValue(); break;
                                case ERROR: break;
                                case FORMULA: break;
                                case NUMERIC:
                                    if (HSSFDateUtil.isCellDateFormatted(cell)) {
                                        Date date = cell.getDateCellValue();
                                        if (date != null)
                                            v = date;
                                    }
                                    else
                                        v = cell.getNumericCellValue();
                                    break;
                                case STRING: v = cell.getStringCellValue(); break;
                                default:break;
                            }


                        }
                        l2.add(v);
                    }
                }
                l1.add(l2.toArray(new Object[0]));
            }
            l0.add(l1.toArray(new Object[0][0]));
        }

        return l0.toArray(new Object[0][0][0]);
    }


    public static File writeExcel(List data, List<FieldInterfaced> colFields) throws IOException, InvalidFormatException {
        String archivo = UUID.randomUUID().toString();

        File temp = (System.getProperty("tmpdir") == null)?File.createTempFile(archivo, ".xlsx"):new File(new File(System.getProperty("tmpdir")), archivo + ".xlsx");


        System.out.println("java.io.tmpdir=" + System.getProperty("java.io.tmpdir"));
        System.out.println("Temp file : " + temp.getAbsolutePath());

        Workbook wb = new XSSFWorkbook();
        CreationHelper createHelper = wb.getCreationHelper();
            Sheet sheet = wb.createSheet();
            for (int posfila = 0; posfila < data.size(); posfila++) {
                Object l2 = data.get(posfila);
                Row row = sheet.createRow(posfila);
                for (int poscol = 0; poscol < colFields.size(); poscol++) {
                    Cell cell = row.createCell(poscol);

                    Object v = null;
                    try {
                        v = (l2 instanceof Object[])?((Object[])l2)[poscol + 2]:ReflectionHelper.getValue(colFields.get(poscol), l2);

                        fillCell(wb, createHelper, cell, v);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }


                }
            }

        FileOutputStream fileOut = new FileOutputStream(temp);
        wb.write(fileOut);
        fileOut.close();

        return temp;
    }


    public static File writeExcel(Object[][][] data) throws IOException, InvalidFormatException {
        String archivo = UUID.randomUUID().toString();

        File temp = (System.getProperty("tmpdir") == null)?File.createTempFile(archivo, ".xlsx"):new File(new File(System.getProperty("tmpdir")), archivo + ".xlsx");


        System.out.println("java.io.tmpdir=" + System.getProperty("java.io.tmpdir"));
        System.out.println("Temp file : " + temp.getAbsolutePath());

        Workbook wb = new XSSFWorkbook();
        CreationHelper createHelper = wb.getCreationHelper();
        for (int poshoja = 0; poshoja < data.length; poshoja++) {
            Object[][] l1 = data[poshoja];
            Sheet sheet = wb.createSheet();
            for (int posfila = 0; posfila < l1.length; posfila++) {
                Object[] l2 = l1[posfila];
                Row row = sheet.createRow(posfila);
                for (int poscol = 0; poscol < l2.length; poscol++) {
                    Cell cell = row.createCell(poscol);

                    Object v = l2[poscol];

                    fillCell(wb, createHelper, cell, v);

                }
            }
        }

        FileOutputStream fileOut = new FileOutputStream(temp);
        wb.write(fileOut);
        fileOut.close();

        return temp;
    }

    private static void fillCell(Workbook wb, CreationHelper createHelper, Cell cell, Object v) {
        if (v == null) {
            cell.setCellType(CellType.BLANK);
        } else if (v instanceof Double || v instanceof Integer || v instanceof Long) {
            cell.setCellType(CellType.NUMERIC);
            cell.setCellValue(Double.parseDouble("" + v));
        } else if (v instanceof Date || v instanceof LocalDate || v instanceof LocalDateTime  || v instanceof LocalTime) {
            cell.setCellType(CellType.NUMERIC);
            if (v instanceof LocalTime) {
                CellStyle cellStyle = wb.createCellStyle();
                cellStyle.setDataFormat(createHelper.createDataFormat().getFormat("HH:mm"));
                cell.setCellStyle(cellStyle);
                cell.setCellValue(HSSFDateUtil.convertTime(((LocalTime)v).format(DateTimeFormatter.ofPattern("HH:mm"))));
            } else if (v instanceof Date) {
                CellStyle cellStyle = wb.createCellStyle();
                cellStyle.setDataFormat(createHelper.createDataFormat().getFormat("d/m/yy"));
                cell.setCellStyle(cellStyle);
                cell.setCellValue(HSSFDateUtil.getExcelDate((Date) v));
            } else if (v instanceof LocalDate) {
                CellStyle cellStyle = wb.createCellStyle();
                cellStyle.setDataFormat(createHelper.createDataFormat().getFormat("d/m/yy"));
                cell.setCellStyle(cellStyle);
                cell.setCellValue(HSSFDateUtil.getExcelDate(Date.from((((LocalDate)v).atStartOfDay()).atZone(ZoneId.systemDefault()).toInstant())));
            } else if (v instanceof LocalDateTime) {
                CellStyle cellStyle = wb.createCellStyle();
                cellStyle.setDataFormat(createHelper.createDataFormat().getFormat("d/m/yy HH:mm"));
                cell.setCellStyle(cellStyle);
                cell.setCellValue(HSSFDateUtil.getExcelDate(Date.from(((LocalDateTime)v).atZone(ZoneId.systemDefault()).toInstant())));
            }

        } else if (v instanceof Boolean) {
            cell.setCellType(CellType.BOOLEAN);
            cell.setCellValue((Boolean) v);
        } else {
            cell.setCellType(CellType.STRING);
            cell.setCellValue("" + v);
        }
    }


    public static void resend(String host, int port, String user, String password, Message m, String subject, String to) throws MessagingException, EmailException, IOException {
        resend(host, port, user, password, m, subject, to, null, null);
    }

    public static void resend(String host, int port, String user, String password, Message m, String subject, String to, String cc) throws MessagingException, EmailException, IOException {
        resend(host, port, user, password, m, subject, to, cc, null);
    }

    public static void resend(String host, int port, String user, String password, Message m, String subject, String to, String cc, String postscript) throws MessagingException, EmailException, IOException {

        HtmlEmail email = new HtmlEmail();
        //Email email = new HtmlEmail();
        email.setHostName(host);
        email.setSmtpPort(port);
        email.setAuthenticator(new DefaultAuthenticator(user, password));
        //email.setSSLOnConnect(true);



        System.out.println("EmailHelper-->resend : " + " , to : " + to + " , user : "+ user + "  , cc  : "  + cc );

        if (subject == null) subject = "";
        if (!"".equals(subject)) subject += " / ";
        subject += m.getSubject();

        try{
            InternetAddress sender = (InternetAddress)m.getFrom()[0];
            subject += " - SENDER: " + sender.getAddress();
        }catch (Exception e) {
            subject += " - NO SENDER";
        }
        email.setSubject(subject);
        email.setFrom(user);

        System.out.println("Resending email to : " + to);

        if (!com.google.common.base.Strings.isNullOrEmpty(cc)) email.getCcAddresses().add(new InternetAddress(cc));

        email.addTo(to);

        if (!com.google.common.base.Strings.isNullOrEmpty(postscript)) {
            email.addPart(postscript, "text/html");
        }

        email.addPart((MimeMultipart) m.getContent());

        email.buildMimeMessage();
        email.sendMimeMessage();

    }


    public static void addTos(Message m, String qui) throws EmailException, AddressException, MessagingException {

        StringTokenizer st = new StringTokenizer(qui, ";, ");
        while (st.hasMoreTokens()) {
            String adreca = st.nextToken();
            if (!adreca.trim().equals("")) {
                m.addRecipient(Message.RecipientType.TO,
                        new InternetAddress(adreca.trim()));
            }

        }

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


    public static void loadProperties() {
        if (!propertiesLoaded) {



            Painter.paint("Hello");
            System.out.println();
            Painter.paint("MATEU");



            System.out.println("Registrando concerters beanutils...");
            ConvertUtils.register(new MiURLConverter(), URL.class);

            System.out.println("Loading properties...");
            propertiesLoaded = true;
            InputStream s = null;
            try {
                if (System.getProperty("appconf") != null) {
                    System.out.println("Loading properties from file " + System.getProperty("appconf"));
                    s = new FileInputStream(System.getProperty("appconf"));
                } else {
                    s = Helper.class.getResourceAsStream("/appconf.properties");
                    System.out.println("Loading properties classpath /appconf.properties");
                }

                if (s != null) {

                    Properties p = new Properties();
                    p.load(s);

                    for (Map.Entry<Object, Object> e : p.entrySet()) {
                        System.out.println("" + e.getKey() + "=" + e.getValue());
                        if (System.getProperty("" + e.getKey()) == null) {
                            System.setProperty("" + e.getKey(), "" + e.getValue());
                            System.out.println("property fixed");
                        } else {
                            System.out.println("property " + e.getKey() + " is already set with value " + System.getProperty("" + e.getKey()));
                        }
                    }

                    if (System.getProperty("heroku.database.url") != null) {

                        System.out.println("adjusting jdbc properties for Heroku...");

                        URI dbUri = null;
                        try {
                            dbUri = new URI(System.getProperty("heroku.database.url"));
                        } catch (URISyntaxException e) {
                            e.printStackTrace();
                        }


                        System.setProperty("eclipselink.target-database", "io.mateu.common.model.util.MiPostgreSQLPlatform");
                        System.setProperty("javax.persistence.jdbc.driver", "org.postgresql.Driver");

                        String username = dbUri.getUserInfo().split(":")[0];
                        String password = dbUri.getUserInfo().split(":")[1];
                        String dbUrl = "jdbc:postgresql://" + dbUri.getHost() + ':' + dbUri.getPort() + dbUri.getPath() + "?sslmode=require&user=" + username + "&password=" + password;


                        System.setProperty("javax.persistence.jdbc.url", dbUrl);
                        System.getProperties().remove("javax.persistence.jdbc.user");
                        System.getProperties().remove("javax.persistence.jdbc.password");


                    } else if (System.getProperty("javax.persistence.jdbc.url", "").contains("postgres")) {
                        System.setProperty("eclipselink.target-database", "io.mateu.common.model.util.MiPostgreSQLPlatform");
                    }

                } else {
                    System.out.println("No appconf. Either set -Dappconf=xxxxxx.properties or place an appconf.properties file in your classpath.");
                }

            } catch (FileNotFoundException e1) {
                e1.printStackTrace();
            } catch (IOException e1) {
                e1.printStackTrace();
            }

        } else {
            System.out.println("Properties already loaded");
        }
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
        byte data[] = new byte[BUFFER];
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
        BufferedInputStream f;
        try {
            f = new BufferedInputStream(new FileInputStream(fn));
            f.read(buffer);
            s = new String(buffer);
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return s;
    }


    private static final int BUFFER = 2048;
    public static byte[] leerByteArray(InputStream is) {
        int count;
        byte data[] = new byte[BUFFER];
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

    public static String[][] parsearCSV(String txt, char delimitador) {
        return CSVParser.parse(txt,delimitador);
    }

    public static String[][] parsearCSV(String txt) {
        return parsearCSV(txt, ',');
    }

    public static String[][] leerCSV(String path, char delimitador) {
        return CSVParser.parse(leerFichero(path),delimitador);
    }

    public static String[][] leerCSV(String path) {
        return leerCSV(path, ',');
    }

    public static void escribirCSV(List<String[]> data, OutputStream os) throws IOException {
        CSVPrinter p = new CSVPrinter(os);
        for (String[] l : data) p.writeln(l);
        p.close();
    }

    public static void escribirCSV(List<String[]> data, OutputStream os , char delimiter) throws IOException {
        CSVPrinter p = new CSVPrinter(os);
        p.changeDelimiter(delimiter);
        for (String[] l : data) p.writeln(l);
        p.close();
    }

    public static void escribirCSV(List<String[]> data, String fileName) throws IOException {
        CSVPrinter p = new CSVPrinter(new FileOutputStream(fileName));
        for (String[] l : data) p.writeln(l);
        p.close();
    }

    public static void escribirCSV(List<String[]> data, String path , char delimiter ) throws IOException {
        CSVPrinter p = new CSVPrinter(new FileOutputStream(path));
        p.changeDelimiter(delimiter);
        for (String[] l : data) p.writeln(l);
        p.close();
    }

    public static String[][] leerCSV(Class c, String path, char delimitador) {
        return CSVParser.parse(leerFichero(c, path), delimitador);
    }

    public static String[][] leerCSV(Class c, String path) {
        return leerCSV(c, path, ',');
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


    public static String runCommand(String command) throws IOException {

        String homeDirectory = System.getProperty("user.home");
        Process process = Runtime.getRuntime().exec(command);
        String r = Helper.leerInputStream(process.getInputStream(), "utf-8");

        //StreamGobbler streamGobbler = new StreamGobbler(process.getInputStream(), System.out::println);
        //Executors.newSingleThreadExecutor().submit(streamGobbler);
        //int exitCode = process.waitFor();
        //assert exitCode == 0;

        return r;
    }

    public static String toHtml(String s) {
        if (!Strings.isNullOrEmpty(s)) return s.replaceAll("\\\n", "<br/>");
        else return s;
    }

    public static String getMemInfo() {
        return new MemInfo().toString();
    }


    public static byte[] fop(Source xslfo, Source xml) throws IOException, SAXException {
        long t0 = new Date().getTime();


// Step 1: Construct a FopFactory by specifying a reference to the configuration file
// (reuse if you plan to render multiple documents!)

        FopFactoryBuilder builder = new FopFactoryBuilder(new File(".").toURI());
        builder.setStrictFOValidation(false);
        builder.setBreakIndentInheritanceOnReferenceAreaBoundary(true);
        builder.setSourceResolution(96); // =96dpi (dots/pixels per Inch)
        FopFactory fopFactory = builder.build();
        //FopFactory fopFactory = FopFactory.newInstance(new Resource("C:/Temp/fop.xconf"));


        // Step 2: Set up output stream.
// Note: Using BufferedOutputStream for performance reasons (helpful with FileOutputStreams).
        //OutputStream out = new BufferedOutputStream(new FileOutputStream(new Resource("C:/Temp/myfile.pdf")));
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            // Step 3: Construct fop with desired output format
            Fop fop = fopFactory.newFop(MimeConstants.MIME_PDF, out);

            // Step 4: Setup JAXP using identity transformer
            TransformerFactory factory = TransformerFactory.newInstance();
            Transformer transformer = factory.newTransformer(xslfo); // identity transformer

		    /*
		    StreamResult xmlOutput = new StreamResult(new StringWriter());
		    //transformer.setOutputProperty(OutputKeys.INDENT, "yes");
		    //transformer.setOutputProperty("{http://xml.apache.org/xslt}indent-amount", "2");
		    transformer.transform(src, xmlOutput);

		    System.out.println(xmlOutput.getWriter().toString());
		    */

            // Step 5: Setup input and output for XSLT transformation
            // Setup input stream
            //Source src = new StreamSource(new StringReader(xml));

            // Resulting SAX events (the generated FO) must be piped through to FOP
            Result res = new SAXResult(fop.getDefaultHandler());

            // Step 6: Start XSLT transformation and FOP processing
            transformer.transform(xml, res);

        } catch (FOPException e) {
            e.printStackTrace();
        } catch (TransformerConfigurationException e) {
            e.printStackTrace();
        } catch (TransformerException e) {
            e.printStackTrace();
        } finally {
            //Clean-up
            out.close();
        }

        return out.toByteArray();
    }



    public static URL queryToPdf(Query query)throws Throwable {

        return Helper.listToPdf(query.getResultList());

    }


    public static URL viewToPdf(RpcView view, Object filters)throws Throwable {

        return listToPdf(view.rpc(filters, 0, Integer.MAX_VALUE));

    }

    public static Object listViewComponentToPdf(ListViewComponent listViewComponent, Object filters) throws Throwable {
        return listToPdf(listViewComponent.findAll(filters, null, 0, Integer.MAX_VALUE), listViewComponent.getColumnFields(listViewComponent.getColumnType()));
    }

    public static URL listToPdf(List list)throws Throwable {

        return listToPdf(list, null);

    }

    public static URL listToPdf(List list, List<FieldInterfaced> colFields)throws Throwable {

        String[] xslfo = {""};

        Helper.notransact(em -> xslfo[0] = AppConfig.get(em).getXslfoForList());

        long t0 = new Date().getTime();


        try {


            Class rowClass =(list.size() > 0)?list.get(0).getClass():EmptyRow.class;

            Document xml = new Document();
            Element arrel = new Element("root");
            xml.addContent(arrel);


            Element cab = new Element("header");
            arrel.addContent(cab);

            Element lineas = new Element("lines");
            arrel.addContent(lineas);


            if (Object[].class.equals(rowClass)) {

                List<FieldInterfaced> rowFields = (colFields != null)?colFields:getColumnFields(rowClass);


                int xx = 1;
                int pixels = 0;

                for (FieldInterfaced c : rowFields){
                    String alineado = "left";
                    Element aux = new Element("column");
                    cab.addContent(aux);
                    aux.setAttribute("label", ReflectionHelper.getCaption(c));
                    int ancho = 200;
                    aux.setAttribute("width", "" +  ancho / 1.5);
                    //if (ColumnAlignment.CENTER.equals(c.getAlignment())) alineado = "center";
                    //if (ColumnAlignment.RIGHT.equals(c.getAlignment())) alineado = "right";
                    aux.setAttribute("align", alineado);
                    pixels += ancho;
                }

                String ancho = "21cm";
                String alto = "29.7cm";
                if (pixels > 750){
                    alto = "21cm";
                    ancho = "29.7cm";
                }
                arrel.setAttribute("width", ancho);
                arrel.setAttribute("height", alto);

                for (Object x : list){

                    Element linea = new Element("line");
                    lineas.addContent(linea);

                    int col = 2;
                    for (FieldInterfaced c : rowFields){

                        Element cell = new Element("cell");
                        linea.addContent(cell);
                        Object v = ((Object[])x)[col++];
                        String text = "";
                        if (v != null) text += v;
                        if (v instanceof Double){
                            DecimalFormat dfm = new DecimalFormat("#0.00");
                            text = dfm.format(((Double)v));
                        }
                        cell.setText(text);

                    }

                }

            } else {

                List<FieldInterfaced> rowFields = getColumnFields(rowClass);


                int xx = 1;
                int pixels = 0;

                for (FieldInterfaced c : rowFields){
                    String alineado = "left";
                    Element aux = new Element("column");
                    cab.addContent(aux);
                    aux.setAttribute("label", ReflectionHelper.getCaption(c));
                    int ancho = 200;
                    aux.setAttribute("width", "" +  ancho / 1.5);
                    //if (ColumnAlignment.CENTER.equals(c.getAlignment())) alineado = "center";
                    //if (ColumnAlignment.RIGHT.equals(c.getAlignment())) alineado = "right";
                    aux.setAttribute("align", alineado);
                    pixels += ancho;
                }

                String ancho = "21cm";
                String alto = "29.7cm";
                if (pixels > 750){
                    alto = "21cm";
                    ancho = "29.7cm";
                }
                arrel.setAttribute("width", ancho);
                arrel.setAttribute("height", alto);

                for (Object x : list){

                    Element linea = new Element("line");
                    lineas.addContent(linea);

                    for (FieldInterfaced c : rowFields){

                        Element cell = new Element("cell");
                        linea.addContent(cell);
                        Object v = ReflectionHelper.getValue(c, x);
                        String text = "";
                        if (v != null) text += v;
                        if (v instanceof Double){
                            DecimalFormat dfm = new DecimalFormat("#0.00");
                            text = dfm.format(((Double)v));
                        }
                        cell.setText(text);

                    }

                }

            }


            if (list.size() >= 5000) {
                Element linea = new Element("line");
                lineas.addContent(linea);

                Element txt = new Element("cell");
                linea.addContent(txt);

                txt.setText("HAY MAS DE 5000 LINEAS. CONTACTA CON EL DEPARTAMENTO DE DESARROLLO SI QUIERES EL EXCEL COMPLETO...");
            }

            try {
                String archivo = UUID.randomUUID().toString();

                File temp = (System.getProperty("tmpdir") == null)?File.createTempFile(archivo, ".pdf"):new File(new File(System.getProperty("tmpdir")), archivo + ".pdf");


                System.out.println("java.io.tmpdir=" + System.getProperty("java.io.tmpdir"));
                System.out.println("Temp file : " + temp.getAbsolutePath());

                FileOutputStream fileOut = new FileOutputStream(temp);
                String sxml = new XMLOutputter(Format.getPrettyFormat()).outputString(xml);
                System.out.println("xslfo=" + xslfo);
                System.out.println("xml=" + sxml);
                fileOut.write(fop(new StreamSource(new StringReader(xslfo[0])), new StreamSource(new StringReader(sxml))));
                fileOut.close();

                String baseUrl = System.getProperty("tmpurl");
                if (baseUrl == null) {
                    return temp.toURI().toURL();
                }
                return new URL(baseUrl + "/" + temp.getName());

            } catch (IOException e) {
                e.printStackTrace();
            }


        } catch (Exception e1) {
            e1.printStackTrace();
        }


        return null;
    }


    private static List<FieldInterfaced> getColumnFields(RpcView view, Class rowClass) {
        List<FieldInterfaced> cols = ReflectionHelper.getAllFields(rowClass);
        return cols;
    }

    private static List<FieldInterfaced> getColumnFields(Class rowClass) {
        List<FieldInterfaced> cols = ReflectionHelper.getAllFields(rowClass);
        return cols;
    }




    public static URL queryToExcel(Query query)throws Throwable {

        return Helper.listToExcel(query.getResultList());

    }


    public static URL viewToExcel(RpcView view, Object filters)throws Throwable {

        return listToExcel(view.rpc(filters, 0, Integer.MAX_VALUE));

    }

    public static Object listViewComponentToExcel(ListViewComponent listViewComponent, Object filters) throws Throwable {
        return listToExcel(listViewComponent.findAll(filters, null, 0, Integer.MAX_VALUE), listViewComponent.getColumnFields(listViewComponent.getColumnType()));
    }

    public static URL listToExcel(List list)throws Throwable {

        return listToExcel(list, null);

    }

    public static URL listToExcel(List list, List<FieldInterfaced> colFields)throws Throwable {

        long t0 = new Date().getTime();


        try {

            File temp = writeExcel(list, colFields);

            String baseUrl = System.getProperty("tmpurl");
            if (baseUrl == null) {
                return temp.toURI().toURL();
            }
            return new URL(baseUrl + "/" + temp.getName());

        } catch (Exception e1) {
            e1.printStackTrace();
        }


        return null;

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

    public static Map<String, Object> getGeneralData() throws Throwable {
        Map<String, Object> data = new HashMap<>();

        Helper.notransact(em -> {

            AppConfig c = AppConfig.get(em);

            data.put("businessname", c.getBusinessName());
            if (c.getLogo() != null) data.put("logourl", c.getLogo().toFileLocator().getUrl());


        });

        return data;
    }


    public static void main(String[] args) {
        try {
            System.out.println(Helper.toJson(Helper.fromYaml(Files.toString(new File("/home/miguel/work/initialdata.yml"), Charset.defaultCharset()))));

            Map<String, Object> o = Helper.fromYaml(Files.toString(new File("/home/miguel/work/initialdata.yml"), Charset.defaultCharset()));


            System.out.println(Helper.get(o, "smtp/host"));


        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static Element toXml(Object o) {
        return toXml(o, new ArrayList<>());
    }

    public static Element toXml(Object o, List visited) {
        if (o == null) {
            return null;
        } else {
            if (!visited.contains(o)) {
                visited.add(o);
            }
            Element e = new Element(o.getClass().getSimpleName());
            e.setAttribute("className", o.getClass().getName());
            for (FieldInterfaced f : ReflectionHelper.getAllFields(o.getClass())) {
                try {
                    Object i = ReflectionHelper.getValue(f, o);

                    if (i != null) {
                        if (ReflectionHelper.isBasico(i)) {
                            e.setAttribute(f.getName(), "" + i);
                        } else {

                            //todo: añadir casos collection y map

                            e.addContent(toXml(i, visited));
                        }
                    }

                } catch (Exception e1) {
                    e1.printStackTrace();
                }
            }
            return e;
        }
    }


    public static Object fromXml(String s) {
        if (Strings.isNullOrEmpty(s)) return null;
        else {
            try {
                Document doc = new SAXBuilder().build(new StringReader(s));

                Element root = doc.getRootElement();

                Object o = null;

                //todo: acabar

                if (root.getAttribute("className") != null && !Strings.isNullOrEmpty(root.getAttributeValue("className"))) {
                    o = Class.forName(root.getAttributeValue("className")).newInstance();
                } else {
                    o = new HashMap<>();
                }

                return o;

            } catch (Exception e) {
                e.printStackTrace();
                return null;
            }
        }
    }
}
