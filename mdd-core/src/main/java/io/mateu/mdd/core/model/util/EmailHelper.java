package io.mateu.mdd.core.model.util;

import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import io.mateu.mdd.core.util.JPATransaction;
import io.mateu.mdd.core.model.config.AppConfig;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.util.JPATransaction;
import org.apache.commons.mail.*;

import javax.mail.internet.InternetAddress;
import javax.persistence.EntityManager;
import java.net.URL;
import java.util.List;

public class EmailHelper {

    private static boolean testing;

    public static boolean isTesting() {
        return testing;
    }

    public static void setTesting(boolean testing) {
        EmailHelper.testing = testing;
    }

    public static void sendEmail(String toEmail, String subject, String text, boolean noCC) throws Throwable {
        sendEmail(toEmail, subject, text, noCC, (URL) null);
    }

    public static void sendEmail(String toEmail, String subject, String text, boolean noCC, URL attachment) throws Throwable {
        sendEmail(toEmail, subject, text, noCC, attachment != null?Lists.newArrayList(attachment):null);
    }


    public static void sendEmail(String toEmail, String subject, String text, boolean noCC, List<URL> attachments) throws Throwable {

        System.out.println("Sending email to " + toEmail);
        System.out.println("Subject: " + subject);
        System.out.println("Text: " + text);

        if (isTesting()) {

            System.out.println("************************************");
            System.out.println("Mail not sent as we are TESTING");
            System.out.println("************************************");


        } else {

            Helper.transact(new JPATransaction() {
                @Override
                public void run(EntityManager em) throws Throwable {

                    AppConfig c = AppConfig.get(em);

                    if (checkAppConfigForSMTP(c)) {
                        HtmlEmail email = new HtmlEmail();
                        email.setHostName(c.getAdminEmailSmtpHost());
                        email.setSmtpPort(c.getAdminEmailSmtpPort());
                        email.setAuthenticator(new DefaultAuthenticator(c.getAdminEmailUser(), c.getAdminEmailPassword()));
                        //email.setSSLOnConnect(true);
                        email.setFrom(c.getAdminEmailFrom());
                        if (!noCC && !Strings.isNullOrEmpty(c.getAdminEmailCC())) email.getCcAddresses().add(new InternetAddress(c.getAdminEmailCC()));

                        email.setSubject(subject);
                        //email.setMsg(io.mateu.ui.mdd.server.util.Helper.freemark(template, getData()));
                        email.setHtmlMsg(text);
                        email.addTo((!Strings.isNullOrEmpty(System.getProperty("allemailsto")))?System.getProperty("allemailsto"):toEmail);

                        if (attachments != null) for (URL u : attachments) email.attach(u, u.toString().substring(u.toString().lastIndexOf("/") + 1), "");

                        email.send();

                        System.out.println("******* Email sent");

                    } else {
                        System.out.println("************************************");
                        System.out.println("Missing SMTP confirguration. Please go to admin > Appconfig and fill");
                        System.out.println("************************************");
                    }
                }
            });

        }

    }

    private static boolean checkAppConfigForSMTP(AppConfig c) {

        boolean ok = true;

        ok &= c.getAdminEmailSmtpPort() > 0;
        ok &= !Strings.isNullOrEmpty(c.getAdminEmailSmtpHost());
        ok &= !Strings.isNullOrEmpty(c.getAdminEmailUser());

        return ok;

    }

    public static void main(String[] args) throws EmailException {


        send("miguelperezcolom@gmail.com", "demo@quotravel.eu", "antonia123", "mail.quotravel.eu", 25);
        //send("miguel@quotravel.eu", "demo@quotravel.eu", "antonia123", "mail.quotravel.eu", 25);


    }

    private static void send(String a, String de, String pwd, String host, int port) throws EmailException {

        System.out.println("Sending email to " + a);
        System.out.println("Subject: " + de);
        System.out.println("Pwd: " + pwd);


        if (isTesting()) {

            System.out.println("************************************");
            System.out.println("Mail not sent as we are TESTING");
            System.out.println("************************************");


        } else {
            Email email = new SimpleEmail();
            //email.setHostName("smtp.googlemail.com");
            //email.setSmtpPort(465);
            email.setHostName(host);
            email.setSmtpPort(port);
            email.setAuthenticator(new DefaultAuthenticator(de, pwd));
            //email.setSSLOnConnect(true);
            email.setFrom(de);
            email.setSubject("TestMail 2");
            email.setMsg("This is a test mail ... :-)");
            email.addTo(a);
            email.send();

            System.out.println("sent");
        }


    }


}
