package io.mateu.mdd.core.model.util;

import com.google.common.base.Strings;
import io.mateu.mdd.core.model.config.AppConfig;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.util.JPATransaction;
import org.apache.commons.mail.DefaultAuthenticator;
import org.apache.commons.mail.Email;
import org.apache.commons.mail.HtmlEmail;

import javax.mail.internet.InternetAddress;
import javax.persistence.EntityManager;

public class EmailHelper {

    public static void sendEmail(String toEmail, String subject, String text, boolean noCC) throws Throwable {

        System.out.println("Sending email to " + toEmail);
        System.out.println("Subject: " + subject);
        System.out.println("Text: " + text);

        Helper.transact(new JPATransaction() {
            @Override
            public void run(EntityManager em) throws Throwable {

                AppConfig c = AppConfig.get(em);

                if (checkAppConfigForSMTP(c)) {
                    Email email = new HtmlEmail();
                    email.setHostName(c.getAdminEmailSmtpHost());
                    email.setSmtpPort(c.getAdminEmailSmtpPort());
                    email.setAuthenticator(new DefaultAuthenticator(c.getAdminEmailUser(), c.getAdminEmailPassword()));
                    //email.setSSLOnConnect(true);
                    email.setFrom(c.getAdminEmailFrom());
                    if (!noCC && !Strings.isNullOrEmpty(c.getAdminEmailCC())) email.getCcAddresses().add(new InternetAddress(c.getAdminEmailCC()));

                    email.setSubject(subject);
                    //email.setMsg(io.mateu.ui.mdd.server.util.Helper.freemark(template, getData()));
                    email.setMsg(text);
                    email.addTo((!Strings.isNullOrEmpty(System.getProperty("allemailsto")))?System.getProperty("allemailsto"):toEmail);
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

    private static boolean checkAppConfigForSMTP(AppConfig c) {

        boolean ok = true;

        ok &= c.getAdminEmailSmtpPort() > 0;
        ok &= !Strings.isNullOrEmpty(c.getAdminEmailSmtpHost());
        ok &= !Strings.isNullOrEmpty(c.getAdminEmailUser());

        return ok;

    }


}
