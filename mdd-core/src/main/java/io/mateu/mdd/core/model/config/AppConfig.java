package io.mateu.mdd.core.model.config;

import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.annotations.NotInEditor;
import io.mateu.mdd.core.annotations.Tab;
import io.mateu.mdd.core.annotations.TextArea;
import io.mateu.mdd.core.model.common.File;
import io.mateu.mdd.core.model.population.Populator;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.util.JPATransaction;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.EntityManager;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * Created by miguel on 19/3/17.
 */
@Entity
@Getter
@Setter
public class AppConfig {

    @Id
    @NotInEditor
    private long id;

    @Tab("General")
    private String businessName;

    @ManyToOne
    private File logo;


    @Tab("Email")
    private String adminEmailSmtpHost;

    private int adminEmailSmtpPort;

    private String adminEmailUser;

    private String adminEmailPassword;

    private String adminEmailFrom;

    private String adminEmailCC;

    private String pop3Host;

    private String pop3User;

    private String pop3Password;

    private String pop3ReboundToEmail;

    @Tab("SMS")
    private boolean clickatellEnabled;
    private String clickatellApiKey;


    @Tab("Templates")
    @TextArea
    private String xslfoForList;

    @TextArea
    private String xslfoForObject;


    //@Tab("Currency exchange")
    //@Convert(converter = CurrencyExchangeConverter.class)
    //private CurrencyExchange currencyExchange = new CurrencyExchange();

    public static AppConfig get(EntityManager em) {
        AppConfig c = em.find(AppConfig.class, 1l);
        if (c == null) {
            try {
                Populator.populate(AppConfig.class);
                c = em.find(AppConfig.class, 1l);
            } catch (Throwable throwable) {
                throwable.printStackTrace();
            }
        }
        return c;
    }

    @Action(value = "Create dummy dates")
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

}
