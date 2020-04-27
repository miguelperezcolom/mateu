package io.mateu.mdd.core.model.config;

import com.google.common.base.Strings;
import com.vaadin.server.ExternalResource;
import com.vaadin.ui.Button;
import com.vaadin.ui.Link;
import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.*;
import io.mateu.mdd.core.app.AbstractApplication;
import io.mateu.mdd.core.model.common.Resource;
import io.mateu.mdd.core.model.util.EmailHelper;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.util.JPATransaction;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import lombok.MateuMDDEntity;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.mail.DefaultAuthenticator;
import org.apache.commons.mail.HtmlEmail;

import javax.mail.internet.InternetAddress;
import javax.persistence.*;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * Created by miguel on 19/3/17.
 */
@Slf4j@MateuMDDEntity
public class AppConfig {

    @Section("General")
    @Id
    @NotInEditor
    private long id;

    private String businessName;

    @ManyToOne(cascade = CascadeType.ALL)
    private Resource logo;


    @Section("Email")
    @FieldGroup("Setup")
    private String adminEmailSmtpHost;

    private int adminEmailSmtpPort;

    private boolean adminEmailStartTLS;

    private boolean adminEmailSSLOnConnect;

    @FieldGroup("Admin credentials")
    private String adminEmailUser;

    @Password
    private String adminEmailPassword;

    private String adminEmailFrom;

    private String adminEmailCC;

    @FieldGroup("Admin check")
    @Transient
    private Button check = new Button("Test", e -> {

        try {

            HtmlEmail email = new HtmlEmail();
            email.setHostName(adminEmailSmtpHost);
            email.setSmtpPort(adminEmailSmtpPort);
            email.setAuthenticator(new DefaultAuthenticator(adminEmailUser, adminEmailPassword));
            email.setSSLOnConnect(adminEmailSSLOnConnect);
            email.setStartTLSEnabled(adminEmailStartTLS);
            email.setFrom(adminEmailFrom);
            if (!Strings.isNullOrEmpty(adminEmailCC)) email.getCcAddresses().add(new InternetAddress(adminEmailCC));

            email.setSubject("Test email");
            email.setHtmlMsg("This is a test email");
            email.addTo((!Strings.isNullOrEmpty(System.getProperty("allemailsto")))?System.getProperty("allemailsto"):"miguelperezcolom@gmail.com");

            EmailHelper.send(email);


            MDD.info("Email sent OK");

        } catch (Exception ex) {
            MDD.alert(ex);
        }

    });

    @Transient
    private VerticalLayout gmailRequiredLinks = new LinksList(
            new Link("https://myaccount.google.com/lesssecureapps", new ExternalResource("https://myaccount.google.com/lesssecureapps"))
            , new Link("https://accounts.google.com/DisplayUnlockCaptcha", new ExternalResource("https://accounts.google.com/DisplayUnlockCaptcha"))
    );


    @FieldGroup("Pop3")
    private String pop3Host;

    private String pop3User;

    @Password
    private String pop3Password;

    private String pop3ReboundToEmail;

    @Section("SMS")
    private boolean clickatellEnabled;
    private String clickatellApiKey;

    @Section("Telegram")
    private boolean telegramEnabled;
    private String telegramBotToken;

    @Section("DeepL")
    private boolean deeplEnabled;
    private String deeplAuthKey;

    @Action(order = 10)
    public void testDeepL() {

    }


    @Section("CMS")
    private String nginxConfigDirectory = "/etc/nginx/conf.d";

    private String nginxReloadCommand = "service nginx reload";



    @Section("Templates")
    @TextArea
    private String xslfoForList;

    @TextArea
    private String xslfoForObject;


    //@Section("Currency exchange")
    //@Convert(converter = CurrencyExchangeConverter.class)
    //private CurrencyExchange currencyExchange = new CurrencyExchange();

    public static AppConfig get(EntityManager em) {
        AppConfig c = em.find(AppConfig.class, 1l);
        if (c == null) {
            try {
                AbstractApplication.get().getPopulator().populate(MDDUI.createApp().getAppConfigClass());
                c = em.find(AppConfig.class, 1l);
            } catch (Throwable throwable) {
                throwable.printStackTrace();
            }
        }
        return c;
    }

    @Action(value = "Create dummy dates", order = 100)
    public void createDummyDates() throws Throwable {
        Helper.transact(new JPATransaction() {
            @Override
            public void run(EntityManager em) throws Throwable {
                LocalDate d = LocalDate.parse("01/01/2000", DateTimeFormatter.ofPattern("dd/MM/yyyy"));
                LocalDate hasta = LocalDate.parse("01/01/2100", DateTimeFormatter.ofPattern("dd/MM/yyyy"));
                while (d.isBefore(hasta)) {
                    em.persist(new DummyDate(d));
                    d = d.plusDays(1);
                }
            }
        });
    }

    public static void main(String[] args) {
       testPureEmail();
    }

    private static void testPureEmail() {
        try {

            HtmlEmail email = new HtmlEmail();
            email.setHostName("smtp.gmail.com");
            email.setSmtpPort(587);
            email.setAuthenticator(new DefaultAuthenticator("miguelperezcolom@gmail.com", ""));
            email.setSSLOnConnect(false);
            email.setStartTLSEnabled(true);
            email.setFrom("miguelperezcolom@gmail.com");

            email.setSubject("Test email");
            email.setHtmlMsg("This is a test email");
            email.addTo("miguelperezcolom@gmail.com");

            EmailHelper.send(email);


            log.debug("Email sent OK");

        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }

}
