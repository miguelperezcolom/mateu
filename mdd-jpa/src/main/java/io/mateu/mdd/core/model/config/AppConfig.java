package io.mateu.mdd.core.model.config;

import com.google.common.base.Strings;
import com.vaadin.server.ExternalResource;
import com.vaadin.ui.Button;
import com.vaadin.ui.Link;
import com.vaadin.ui.UI;
import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.core.model.common.Resource;
import io.mateu.mdd.shared.IAppConfig;
import io.mateu.mdd.shared.VaadinHelper;
import io.mateu.mdd.shared.annotations.*;
import io.mateu.util.Helper;
import io.mateu.util.interfaces.IPopulator;
import io.mateu.util.mail.EmailHelper;
import io.mateu.util.notification.Notifier;
import io.mateu.util.persistence.JPAHelper;
import io.mateu.util.persistence.JPATransaction;
import lombok.MateuMDDEntity;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.mail.DefaultAuthenticator;
import org.apache.commons.mail.HtmlEmail;

import javax.mail.internet.InternetAddress;
import javax.persistence.*;
import java.net.URI;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * Created by miguel on 19/3/17.
 */
@Slf4j@MateuMDDEntity
public class AppConfig implements IAppConfig {

    @Section("General")
    @Id
    @NotInEditor
    private long id;

    private String name;

    private String businessName;

    @ManyToOne(cascade = CascadeType.ALL)
    private Resource logo;

    public String getLogoUrl() throws Exception {
        return logo != null?logo.toFileLocator().getUrl():null;
    }

    @Override
    public String getBaseUrl() {
        String u = System.getProperty("baseurl", UI.getCurrent() != null?getBaseUrl(UI.getCurrent()):"");
        if (u.endsWith(VaadinHelper.getAdaptedUIRootPath())) u = u.substring(0, u.lastIndexOf(VaadinHelper.getAdaptedUIRootPath()));
        return u;
    }

    private String getBaseUrl(UI ui) {
        URI u = ui.getPage().getLocation();
        String s = u.getScheme() + "://" + u.getHost() + ((u.getPort() != 80)?":" + u.getPort():"") + "/";
        return s;
    }


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


            Notifier.info("Email sent OK");

        } catch (Exception ex) {
            Notifier.alert(ex);
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

    @Section("Integrations")
    @FieldGroup("SMS")
    private boolean clickatellEnabled;
    private String clickatellApiKey;

    @FieldGroup("Telegram")
    private boolean telegramEnabled;
    private String telegramBotToken;

    @FieldGroup("DeepL")
    private boolean deeplEnabled;
    private String deeplAuthKey;

    @Action(order = 10)
    public void testDeepL() {

    }

    @FieldGroup("Mapbox")
    private String mapboxKey;


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
                Helper.getImpl(IPopulator.class).populate();
                c = em.find(AppConfig.class, 1l);
            } catch (Throwable throwable) {
                throwable.printStackTrace();
            }
        }
        return c;
    }

    @Action(value = "Create dummy dates", order = 100)
    public void createDummyDates() throws Throwable {
        JPAHelper.transact(new JPATransaction() {
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
