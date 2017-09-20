package io.mateu.ui.mdd.server.util;


import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.api.client.http.*;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonObjectParser;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.client.repackaged.com.google.common.base.Strings;
import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import freemarker.template.TemplateExceptionHandler;
import io.mateu.ui.core.server.SQLTransaction;
import io.mateu.ui.core.server.Utils;
import org.apache.commons.mail.DefaultAuthenticator;
import org.apache.commons.mail.EmailException;
import org.apache.commons.mail.HtmlEmail;
import org.apache.poi.hssf.usermodel.HSSFDateUtil;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.jdom2.output.Format;
import org.jdom2.output.XMLOutputter;

import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;
import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;
import javax.sql.DataSource;
import javax.xml.transform.stream.StreamSource;
import java.io.*;
import java.net.URL;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.Statement;
import java.text.DecimalFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

import static io.mateu.ui.core.server.BaseServerSideApp.fop;

/**
 * Created by miguel on 13/9/16.
 */
public class Helper {

    static final HttpTransport HTTP_TRANSPORT = new NetHttpTransport();
    static final com.google.api.client.json.JsonFactory JSON_FACTORY = new JacksonFactory();


    private static DataSource dataSource;
    private static EntityManagerFactory emf;

    private static ObjectMapper mapper = new ObjectMapper();

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

    public static String toJson(Object o) throws IOException {
        return mapper.writeValueAsString(o);
    }


    public static void transact(SQLTransaction t) throws Throwable {

        transact(new JPATransaction() {
            @Override
            public void run(EntityManager em) throws Exception {

                t.run(em.unwrap(Connection.class));

            }
        });

    }



    public static void transact(JPATransaction t) throws Throwable {

        EntityManager em = getEMF().createEntityManager();

        try {

            em.getTransaction().begin();

            t.run(em);


            em.getTransaction().commit();


        } catch (Exception e) {
            e.printStackTrace();
            if (em.getTransaction().isActive()) em.getTransaction().rollback();
            em.close();
            throw e;
        }

        em.close();

    }

    private static EntityManagerFactory getEMF() {
        if (emf == null) {
            emf = Persistence.createEntityManagerFactory("default");
        }
        return emf;
    }

    public static void notransact(SQLTransaction t) throws Throwable {

        transact(new JPATransaction() {
            @Override
            public void run(EntityManager em) throws Exception {

                t.run(em.unwrap(Connection.class));

            }
        });

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

    public static String md5(String s) {
        return s;
    }

    public static void setDataSource(DataSource dataSource) {
        Helper.dataSource = dataSource;
    }


    public static Object[][] select(String sql) throws Throwable {
        final Object[][][] r = {null};

        notransact(new SQLTransaction() {
            @Override
            public void run(Connection conn) throws Exception {

                System.out.println("sql: " + sql); //prettySQLFormat(sql));

                Statement s = conn.createStatement();
                ResultSet rs = s.executeQuery(sql);
                if (rs != null) {
                    ResultSetMetaData rsmd = rs.getMetaData();
                    List<Object[]> aux = new ArrayList<Object[]>();
                    int fila = 0;
                    while (rs.next()) {
                        if (fila > 0 && fila % 1000 == 0) System.out.println("filas =" + fila + ":SQL>>>" + sql.replaceAll("\\n", " ") + "<<<SQL");
                        fila++;
                        Object[] f = new Object[rsmd.getColumnCount()];
                        for (int i = 0; i < rsmd.getColumnCount(); i++) {
                            f[i] = rs.getObject(i + 1);
                        }
                        aux.add(f);
                    }
                    r[0] = aux.toArray(new Object[0][0]);
                }

            }
        });

        return r[0];
    }


    public static void execute(String sql) throws Throwable {

        transact(new SQLTransaction() {
            @Override
            public void run(Connection conn) throws Exception {

                Statement s = conn.createStatement();
                s.execute(sql);

            }
        });

    }

    public static Object selectSingleValue(String sql) throws Throwable {
        Object o = null;
        Object[][] r = select(sql);
        if (r.length > 0 && r[0].length > 0) o = r[0][0];
        return o;
    }


    public static void update(String sql) throws Throwable {

        transact(new SQLTransaction() {
            @Override
            public void run(Connection conn) throws Exception {
                Statement s = conn.createStatement();
                s.executeUpdate(sql);
            }
        });

    }


    public static int getNumberOfRows(String sql) {
        int total = 0;
        if (!Utils.isEmpty(sql)) {
            try {

                if (sql.contains("/*noenelcount*/")) {
                    String sqlx = "";
                    boolean z = true;
                    for (String s : sql.split("/\\*noenelcount\\*/")) {
                        if (z) sqlx += s;
                        z = !z;
                    }
                    sql = sqlx;
                }

                sql = sql.replaceAll("aquilapaginacion", "");

                String aux = "select count(*) from (" + sql + ") x";
                total = ((Long) selectSingleValue(aux)).intValue();
            } catch (Throwable e) {
                e.printStackTrace();
            }
        }
        return total;
    }


    public static Object[][] selectPage(String sql, int desdeFila, int numeroFilas) throws Throwable {
        return select(sql + " LIMIT " + numeroFilas + " OFFSET " + desdeFila);
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
        String c = s.replaceAll(
                String.format("%s|%s|%s",
                        "(?<=[A-Z])(?=[A-Z][a-z])",
                        "(?<=[^A-Z])(?=[A-Z])",
                        "(?<=[A-Za-z])(?=[^A-Za-z])"
                ),
                " "
        ).toLowerCase();
        if (c.length() > 1) c = c.substring(0, 1).toUpperCase() + c.substring(1);

        return c;
    }

    public static String pluralize(String s) {
        if (s == null || "".equals(s)) return s;
        String c = s + "s";
        if (c.endsWith("ys")) c = c.replaceAll("ys$", "ies") ;
        return c;
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
            }
        }

        FileOutputStream fileOut = new FileOutputStream(temp);
        wb.write(fileOut);
        fileOut.close();

        return temp;
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
}
