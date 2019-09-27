package io.mateu.mdd.core.util;


import com.Ostermiller.util.CSVParser;
import com.Ostermiller.util.CSVPrinter;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import com.github.slugify.Slugify;
import com.google.api.client.http.*;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonObjectParser;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.common.base.Charsets;
import com.google.common.base.Strings;
import com.google.common.hash.Hashing;
import com.google.common.io.Files;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.vaadin.data.provider.QuerySortOrder;
import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import freemarker.template.TemplateExceptionHandler;
import io.mateu.mdd.core.annotations.RightAlignedCol;
import io.mateu.mdd.core.asciiart.Painter;
import io.mateu.mdd.core.interfaces.RpcView;
import io.mateu.mdd.core.model.config.AppConfig;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.MiURLConverter;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.workflow.WorkflowEngine;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.ListViewComponent;
import lombok.extern.slf4j.Slf4j;
import org.apache.avalon.framework.configuration.DefaultConfigurationBuilder;
import org.apache.commons.beanutils.ConvertUtils;
import org.apache.commons.mail.DefaultAuthenticator;
import org.apache.commons.mail.EmailException;
import org.apache.commons.mail.HtmlEmail;
import org.apache.fop.apps.*;
import org.apache.poi.hssf.usermodel.HSSFDateUtil;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.eclipse.persistence.config.CacheUsage;
import org.eclipse.persistence.config.QueryHints;
import org.javamoney.moneta.FastMoney;
import org.jdom2.Document;
import org.jdom2.Element;
import org.jdom2.input.SAXBuilder;
import org.jdom2.output.Format;
import org.jdom2.output.XMLOutputter;
import org.jinq.jpa.JPAJinqStream;
import org.jinq.jpa.JinqJPAStreamProvider;
import org.xml.sax.SAXException;

import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMultipart;
import javax.money.MonetaryAmount;
import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;
import javax.persistence.Query;
import javax.script.ScriptContext;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;
import javax.sql.DataSource;
import javax.validation.ConstraintViolation;
import javax.validation.ConstraintViolationException;
import javax.xml.transform.*;
import javax.xml.transform.sax.SAXResult;
import javax.xml.transform.stream.StreamSource;
import java.io.*;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.charset.Charset;
import java.nio.file.FileSystems;
import java.nio.file.Path;
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
@Slf4j
public class Helper {

    public static boolean propertiesLoaded = false;
    private static org.apache.avalon.framework.configuration.Configuration fopConfig;
    private static Map<String, JinqJPAStreamProvider> streams = new HashMap<>();

    static {
        loadProperties();
        DefaultConfigurationBuilder cfgBuilder = new DefaultConfigurationBuilder();
        try {
            if (!Strings.isNullOrEmpty(System.getProperty("fopconfig"))) {
                log.debug("Loading fop config from " + System.getProperty("fopconfig"));
                fopConfig = cfgBuilder.buildFromFile(new File(System.getProperty("fopconfig")));
            } else {
                log.debug("Loading fop config from classpath: /xsl/fop.xml");
                fopConfig = cfgBuilder.build(Helper.class.getResourceAsStream("/xsl/fop.xml"));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
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




    public static <T> T find(Class<T> type, Object id) throws Throwable {
        Object[] o = {null};
        Helper.notransact(em -> {
            o[0] = em.find(type, id);
        });
        return (T) o[0];
    }



    public static EntityManager getEMFromThreadLocal() {
        return tlem.get();
    }



    public static void transact(JPATransaction t) throws Throwable {
        transact(System.getProperty("defaultpuname", "default"), t);
    }

    public static void transact(String persistenceUnit, JPATransaction t) throws Throwable {

        boolean atTop = WorkflowEngine.activateLocalRunner();

        try {

            EntityManager em = getEMF().createEntityManager();

            try {

                em.getTransaction().begin();

                tlem.set(em);

                t.run(em);

                em.getTransaction().commit();

            } catch (Throwable e) {

                e.printStackTrace();

                WorkflowEngine.cancelLocalRunner();
                if (em.getTransaction().isActive()) em.getTransaction().rollback();
                em.close();
                rethrow(e.getCause() != null && e.getCause() instanceof ConstraintViolationException?e.getCause():e);

            }

            em.close();

        } catch (Throwable e) {
            WorkflowEngine.cancelLocalRunner();
            rethrow(e.getCause() != null && e.getCause() instanceof ConstraintViolationException?e.getCause():e);
        }

        WorkflowEngine.runAndWaitThreadLocalTasks(atTop);
    }

    public static void rethrow(Throwable e) throws Throwable {
        if (e instanceof ConstraintViolationException) {
            StringBuffer sb = new StringBuffer();
            for (ConstraintViolation v : ((ConstraintViolationException)e).getConstraintViolations()) {
                if (sb.length() > 0) sb.append("\n");
                sb.append("" + v.getPropertyPath() + " " + v.getMessage() + " at " + Helper.capitalize(v.getRootBeanClass().getSimpleName()));
            }
            throw new Exception(sb.toString());
        } else throw e;
    }

    public static void printStackTrace(Throwable e) {
        e.printStackTrace();
        if (e instanceof ConstraintViolationException) {
            StringBuffer sb = new StringBuffer();
            for (ConstraintViolation v : ((ConstraintViolationException)e).getConstraintViolations()) {
                if (sb.length() > 0) sb.append("\n");
                sb.append("" + v.getPropertyPath() + " " + v.getMessage() + " at " + Helper.capitalize(v.getRootBeanClass().getSimpleName()));
            }
            log.debug(sb.toString());
        }
    }

    public static void closeEMFs() {
        emf.values().forEach(x -> {
            if (x.isOpen()) x.close();
        });
        emf.clear();
    }

    public static JinqJPAStreamProvider getStreams() {
        return getStreams(System.getProperty("defaultpuname", "default"));
    }

    public static JinqJPAStreamProvider getStreams(String persistenceUnit) {
        JinqJPAStreamProvider s = streams.get(persistenceUnit);
        if (s == null) {
            streams.put(persistenceUnit, s = new JinqJPAStreamProvider(getEMF(persistenceUnit)));
        }
        return s;
    }

    public static EntityManagerFactory getEMF() {
        return getEMF(System.getProperty("defaultpuname", "default"));
    }


    public static EntityManagerFactory getEMF(String persistenceUnit) {
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




    public static List selectObjects(String jpql) throws Throwable {
        return selectObjects(jpql, new HashMap<>());
    }


    public static List selectObjects(String jpql, Map<String, Object> params) throws Throwable {
        List l = new ArrayList<>();

        Helper.notransact(em -> {

            Query q = em.createQuery(jpql);
            q.setHint(QueryHints.CACHE_USAGE, CacheUsage.DoNotCheckCache);

            if (params != null) {
                for (String k : params.keySet()) q.setParameter(k, params.get(k));
            }

            l.addAll(q.getResultList());


        });

        return l;
    }

    public static List selectObjects(String jpql, Class targetClass) throws Throwable {
        return selectObjects(jpql, new HashMap<>(), targetClass);
    }

    public static List selectObjects(String jpql, Map<String, Object> params, Class targetClass) throws Throwable {
        List l = new ArrayList<>();

        Helper.notransact(em -> {

            Query q = em.createQuery(jpql, targetClass);
            q.setHint(QueryHints.CACHE_USAGE, CacheUsage.DoNotCheckCache);

            if (params != null) {
                for (String k : params.keySet()) q.setParameter(k, params.get(k));
            }


            l.addAll(q.getResultList());

        });

        return l;
    }

    //todo: sql nativo

    public static List<Object[]> nativeSelect(String sql) throws Throwable {
        List<Object[]> list = new ArrayList<>();

        Helper.notransact(em -> {

            Query q = em.createNativeQuery(sql);
            list.addAll(q.getResultList());

        });

        return list;
    }

    public static Object nativeSelectValue(String sql) throws Throwable {
        List<Object[]> list = new ArrayList<>();

        Helper.notransact(em -> {

            Query q = em.createNativeQuery(sql);
            list.addAll(q.getResultList());

        });

        return list.size() > 0?(list.get(0) instanceof Object[]?list.get(0)[0]:list.get(0)):null;
    }

    public static List<Object[]> sqlSelectPage(String jpql, int offset, int limit) throws Throwable {
        List<Object[]> list = new ArrayList<>();

        Helper.notransact(em -> {

            Query q = em.createQuery(jpql);

            q.setFirstResult(offset);
            q.setMaxResults(limit);
            q.setHint(QueryHints.CACHE_USAGE, CacheUsage.DoNotCheckCache);


            list.addAll(q.getResultList());

        });

        return list;
    }

    //todo: sql nativo
    public static int sqlCount(String sql) throws Throwable {
        int[] count = {0};

        Helper.notransact(em -> {

            String countjpql = "select count(*) from (" + sql + ") xxx";
            Query q = em.createQuery(countjpql);
            q.setHint(QueryHints.CACHE_USAGE, CacheUsage.DoNotCheckCache);
            count[0] = ((Long)q.getSingleResult()).intValue();


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

        log.debug("freemarker template compiled and applied in " + (new Date().getTime() - t0) + " ms.");

        return out.toString();
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

    public static String camelcasize(String s) {
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
        if (c.length() > 1) {
            String aux = c;
            c = "";
            int pos = 0;
            for (String z : aux.split(" ")) {
                if (pos++ > 0 && !Strings.isNullOrEmpty(z)) c += z.substring(0, 1).toUpperCase() + z.substring(1);
                else c += z;
            }
        }

        return c;
    }

    public static String urlize(String s) {
        return new Slugify().slugify(s);
    }

    public static String pluralize(String s) {
        if (s == null || "".equals(s)) return s;
        if (s.endsWith("s")) s += "es";
        else s += "s";
        if (s.endsWith("ys")) s = s.replaceAll("ys$", "ies") ;
        return s;
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

                            log.debug("" + cell.getCellTypeEnum());
                            log.debug(cell.toString());

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


    public static File writeExcel(Collection data, List<FieldInterfaced> colFields) throws IOException, InvalidFormatException {
        String archivo = UUID.randomUUID().toString();

        File temp = (System.getProperty("tmpdir") == null)?File.createTempFile(archivo, ".xlsx"):new File(new File(System.getProperty("tmpdir")), archivo + ".xlsx");


        log.debug("java.io.tmpdir=" + System.getProperty("java.io.tmpdir"));
        log.debug("Temp file : " + temp.getAbsolutePath());

        Workbook wb = new XSSFWorkbook();
        CreationHelper createHelper = wb.getCreationHelper();
            Sheet sheet = wb.createSheet();
            int posfila = 0;
            for (Iterator i = data.iterator(); i.hasNext(); posfila++) {
                Object l2 = i.next();
                Row row = sheet.createRow(posfila);
                for (int poscol = 0; poscol < colFields.size(); poscol++) {
                    Cell cell = row.createCell(poscol);

                    Object v = null;
                    try {
                        v = (l2 instanceof Object[])?((Object[])l2)[poscol + 1]:ReflectionHelper.getValue(colFields.get(poscol), l2);

                        fillCell(wb, createHelper, cell, v);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }


                }
            }
            //wb.close();

        FileOutputStream fileOut = new FileOutputStream(temp);
        wb.write(fileOut);
        fileOut.close();

        return temp;
    }


    public static File writeExcel(Object[][][] data) throws IOException, InvalidFormatException {
        String archivo = UUID.randomUUID().toString();

        File temp = (System.getProperty("tmpdir") == null)?File.createTempFile(archivo, ".xlsx"):new File(new File(System.getProperty("tmpdir")), archivo + ".xlsx");


        log.debug("java.io.tmpdir=" + System.getProperty("java.io.tmpdir"));
        log.debug("Temp file : " + temp.getAbsolutePath());

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
        wb.close();
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



        log.debug("EmailHelper-->resend : " + " , to : " + to + " , user : "+ user + "  , cc  : "  + cc );

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

        log.debug("Resending email to : " + to);

        if (!Strings.isNullOrEmpty(cc)) email.getCcAddresses().add(new InternetAddress(cc));

        email.addTo(to);

        if (!Strings.isNullOrEmpty(postscript)) {
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
            Painter.paint("MATEU");



            log.debug("Registrando concerters beanutils...");
            ConvertUtils.register(new MiURLConverter(), URL.class);

            log.debug("Loading properties...");
            propertiesLoaded = true;
            InputStream s = null;
            try {
                if (System.getProperty("appconf") != null) {
                    log.debug("Loading properties from file " + System.getProperty("appconf"));
                    s = new FileInputStream(System.getProperty("appconf"));
                } else {
                    s = Helper.class.getResourceAsStream("/appconf.properties");
                    log.debug("Loading properties classpath /appconf.properties");
                }

                if (s != null) {

                    Properties p = new Properties();
                    p.load(s);

                    for (Map.Entry<Object, Object> e : p.entrySet()) {
                        log.debug("" + e.getKey() + "=" + e.getValue());
                        if (System.getProperty("" + e.getKey()) == null) {
                            System.setProperty("" + e.getKey(), "" + e.getValue());
                            log.debug("property fixed");
                        } else {
                            log.debug("property " + e.getKey() + " is already set with value " + System.getProperty("" + e.getKey()));
                        }
                    }

                    if (System.getProperty("heroku.database.url") != null) {

                        log.debug("adjusting jdbc properties for Heroku...");

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
                    s.close();
                } else {
                    log.debug("No appconf. Either set -Dappconf=xxxxxx.properties or place an appconf.properties file in your classpath.");
                }

            } catch (FileNotFoundException e1) {
                e1.printStackTrace();
            } catch (IOException e1) {
                e1.printStackTrace();
            }

        } else {
            log.debug("Properties already loaded");
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


    public static String runCommand(String command) throws IOException, InterruptedException {

        String homeDirectory = System.getProperty("user.home");

        String[] cmd = { "/bin/sh", "-c", command };
        Process process = Runtime.getRuntime().exec(cmd);
        String r = Helper.leerInputStream(process.getInputStream(), "utf-8");
        String e = Helper.leerInputStream(process.getErrorStream(), "utf-8");

        int exitCode = process.waitFor();

        return r + e;
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
        if (fopConfig != null) builder.setConfiguration(fopConfig);
        else {
            builder.setStrictFOValidation(false);
            builder.setBreakIndentInheritanceOnReferenceAreaBoundary(true);
            builder.setSourceResolution(96); // =96dpi (dots/pixels per Inch)
        }
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

		    log.debug(xmlOutput.getWriter().toString());
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


    public static URL viewToPdf(RpcView view, Object filters, List<QuerySortOrder> sortOrders)throws Throwable {

        return listToPdf(view.rpc(filters, sortOrders, 0, Integer.MAX_VALUE));

    }

    public static Object listViewComponentToPdf(ListViewComponent listViewComponent, Object filters) throws Throwable {
        return listToPdf(listViewComponent.getTitle(), listViewComponent.findAll(filters, null, 0, Integer.MAX_VALUE), listViewComponent.getColumnFields(listViewComponent.getColumnType()));
    }

    public static URL listToPdf(Collection list)throws Throwable {

        return listToPdf(null, list, null);

    }

    public static URL listToPdf(String title, Collection list, List<FieldInterfaced> colFields)throws Throwable {

        String[] xslfo = {""};

        Helper.notransact(em -> xslfo[0] = AppConfig.get(em).getXslfoForList());

        long t0 = new Date().getTime();


        try {


            Class rowClass =(list.size() > 0)?list.iterator().next().getClass():EmptyRow.class;

            Document xml = new Document();
            Element arrel = new Element("root");
            xml.addContent(arrel);


            Element cab = new Element("header");
            arrel.addContent(cab);

            if (!Strings.isNullOrEmpty(title)) cab.addContent(new Element("title").setText(title));

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
                    double ancho = ListViewComponent.getColumnWidth(c);
                    aux.setAttribute("width", "" +  ancho / 1.5);

                    if (Integer.class.equals(c.getType()) || int.class.equals(c.getType())
                            || Long.class.equals(c.getType()) || long.class.equals(c.getType())
                            || Double.class.equals(c.getType()) || double.class.equals(c.getType())
                            || BigInteger.class.equals(c.getType()) || BigDecimal.class.equals(c.getType()) || Number.class.equals(c.getType())
                            || FastMoney.class.equals(c.getType()) || MonetaryAmount.class.equals(c.getType())
                            || c.isAnnotationPresent(RightAlignedCol.class)
                            ) {
                        alineado = "right";
                    }

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

                    int col = 1;
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
                    double ancho = ListViewComponent.getColumnWidth(c);
                    aux.setAttribute("width", "" +  ancho / 1.5);

                    if (Integer.class.equals(c.getType()) || int.class.equals(c.getType())
                            || Long.class.equals(c.getType()) || long.class.equals(c.getType())
                            || Double.class.equals(c.getType()) || double.class.equals(c.getType())
                            || BigInteger.class.equals(c.getType()) || BigDecimal.class.equals(c.getType()) || Number.class.equals(c.getType())
                            || FastMoney.class.equals(c.getType()) || MonetaryAmount.class.equals(c.getType())
                            || c.isAnnotationPresent(RightAlignedCol.class)
                            ) {
                        alineado = "right";
                    }

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


                log.debug("java.io.tmpdir=" + System.getProperty("java.io.tmpdir"));
                log.debug("Temp file : " + temp.getAbsolutePath());

                FileOutputStream fileOut = new FileOutputStream(temp);
                String sxml = new XMLOutputter(Format.getPrettyFormat()).outputString(xml);
                log.debug("xslfo=" + xslfo);
                log.debug("xml=" + sxml);
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

    private static List<FieldInterfaced> getColumnFields(Class rowClass) {
        List<FieldInterfaced> cols = ListViewComponent.getColumnFields(rowClass);

        return cols;
    }




    public static URL queryToExcel(Query query)throws Throwable {

        return Helper.listToExcel(query.getResultList());

    }


    public static URL viewToExcel(RpcView view, Object filters, List<QuerySortOrder> sortOrders)throws Throwable {

        return listToExcel(view.rpc(filters, sortOrders, 0, Integer.MAX_VALUE));

    }

    public static Object listViewComponentToExcel(ListViewComponent listViewComponent, Object filters) throws Throwable {
        return listToExcel(listViewComponent.findAll(filters, null, 0, Integer.MAX_VALUE), listViewComponent.getColumnFields(listViewComponent.getColumnType()));
    }

    public static URL listToExcel(Collection list)throws Throwable {

        return listToExcel(list, null);

    }

    public static URL listToExcel(Collection list, List<FieldInterfaced> colFields)throws Throwable {

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
            log.debug(Helper.toJson(Helper.fromYaml(Files.toString(new File("/home/miguel/work/initialdata.yml"), Charset.defaultCharset()))));

            Map<String, Object> o = Helper.fromYaml(Files.toString(new File("/home/miguel/work/initialdata.yml"), Charset.defaultCharset()));


            log.debug("" + Helper.get(o, "smtp/host"));


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

        ScriptEngine engine = new ScriptEngineManager().getEngineByName("javascript");
        ScriptContext context = engine.getContext();
        StringWriter writer = new StringWriter();
        context.setWriter(writer);

        try {
            writer.append("" + engine.eval(operations));
        } catch (ScriptException e) {
            writer.append(e.getMessage());
        }

        String output = writer.toString();
        return output;
    }



    public static void generateQRCodeImage(String text, int width, int height, String filePath)
            throws WriterException, IOException {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height);

        Path path = FileSystems.getDefault().getPath(filePath);
        MatrixToImageWriter.writeToPath(bitMatrix, "PNG", path);
    }


    /*
This method takes the text to be encoded, the width and height of the QR Code,
and returns the QR Code in the form of a byte array.
*/
    public byte[] getQRCodeImage(String text, int width, int height) throws WriterException, IOException {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height);

        ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
        byte[] pngData = pngOutputStream.toByteArray();
        return pngData;
    }



    public static <T> List<T> extend(List<T> list, T o) {
        List<T> l = new ArrayList<T>(list);
        l.add(o);
        return l;
    }
}
