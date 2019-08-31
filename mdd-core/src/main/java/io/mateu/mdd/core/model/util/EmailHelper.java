package io.mateu.mdd.core.model.util;

import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import io.mateu.mdd.core.model.config.AppConfig;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.util.JPATransaction;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.mail.*;

import javax.mail.internet.InternetAddress;
import javax.persistence.EntityManager;
import java.net.URL;
import java.util.List;

@Slf4j
public class EmailHelper {

    private static boolean testing;

    private static EmailMock mock;

    public static boolean isTesting() {
        return testing;
    }

    public static void setTesting(boolean testing) {
        EmailHelper.testing = testing;
    }

    public static void setMock(EmailMock mock) {
        EmailHelper.mock = mock;
        setTesting(mock != null);
    }

    public static EmailMock getMock() {
        return mock;
    }

    public static void sendEmail(String toEmail, String subject, String text, boolean noCC) throws Throwable {
        sendEmail(toEmail, subject, text, noCC, (URL) null);
    }

    public static void sendEmail(String toEmail, String subject, String text, boolean noCC, URL attachment) throws Throwable {
        sendEmail(toEmail, subject, text, noCC, attachment != null?Lists.newArrayList(attachment):null);
    }


    public static void sendEmail(String toEmail, String subject, String text, boolean noCC, List<URL> attachments) throws Throwable {

        if (subject == null) subject = "";
        if (text == null) text = "";

        log.debug("Sending email to " + toEmail);
        log.debug("Subject: " + subject);
        log.debug("Text: " + text);


        String finalSubject = subject;
        String finalText = text;
        Helper.transact(new JPATransaction() {
            @Override
            public void run(EntityManager em) throws Throwable {

                AppConfig c = AppConfig.get(em);

                if (checkAppConfigForSMTP(c)) {
                    HtmlEmail email = new HtmlEmail();
                    email.setHostName(c.getAdminEmailSmtpHost());
                    email.setSmtpPort(c.getAdminEmailSmtpPort());
                    email.setAuthenticator(new DefaultAuthenticator(c.getAdminEmailUser(), c.getAdminEmailPassword()));
                    email.setSSLOnConnect(c.isAdminEmailSSLOnConnect());
                    email.setStartTLSEnabled(c.isAdminEmailStartTLS());
                    email.setFrom(c.getAdminEmailFrom());
                    if (!noCC && !Strings.isNullOrEmpty(c.getAdminEmailCC())) email.getCcAddresses().add(new InternetAddress(c.getAdminEmailCC()));

                    email.setSubject(finalSubject);
                    //email.setMsg(io.mateu.ui.mdd.server.util.Helper.freemark(template, getData()));
                    email.setHtmlMsg(finalText);
                    email.addTo((!Strings.isNullOrEmpty(System.getProperty("allemailsto")))?System.getProperty("allemailsto"):toEmail);

                    if (attachments != null) for (URL u : attachments) email.attach(u, u.toString().substring(u.toString().lastIndexOf("/") + 1), "");

                    EmailHelper.send(email);


                } else {
                    log.debug("************************************");
                    log.debug("Missing SMTP confirguration. Please go to admin > Appconfig and fill");
                    log.debug("************************************");
                }
            }
        });

    }

    public static void send(Email email) throws EmailException {

        if (isTesting()) {

            log.debug("************************************");
            log.debug("Mail not sent as we are TESTING");
            log.debug("************************************");

            if (mock != null) mock.send(email);

        } else {
            email.send();

            log.debug("******* Email sent");
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


        //send("miguel@quotravel.eu", "demo@quotravel.eu", "antonia123", "mail.quotravel.eu", 25);


    }

    private static void send(String a, String de, String pwd, String host, int port, boolean ssl) throws EmailException {

        log.debug("Sending email to " + a);
        log.debug("Subject: " + de);
        log.debug("Pwd: " + pwd);


        if (isTesting()) {

            log.debug("************************************");
            log.debug("Mail not sent as we are TESTING");
            log.debug("************************************");


        } else {
            Email email = new SimpleEmail();
            //email.setHostName("smtp.googlemail.com");
            //email.setSmtpPort(465);
            email.setHostName(host);
            email.setSmtpPort(port);
            email.setAuthenticator(new DefaultAuthenticator(de, pwd));
            //email.setSSLOnConnect(ssl);
            email.setStartTLSEnabled(true);
            email.setFrom(de);
            email.setSubject("TestMail 2");
            email.setMsg("This is a test mail ... :-)");
            email.addTo(a);
            email.send();

            log.debug("sent");
        }


    }


}
