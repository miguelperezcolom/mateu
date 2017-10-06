package io.mateu.mdd.model.config;

import io.mateu.mdd.model.common.File;
import io.mateu.ui.mdd.server.annotations.Action;
import io.mateu.ui.mdd.server.annotations.StartsLine;
import io.mateu.ui.mdd.server.annotations.TextArea;
import io.mateu.ui.mdd.server.util.Helper;
import io.mateu.ui.mdd.server.util.JPATransaction;
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
    private long id;

    private String businessName;

    @ManyToOne
    private File logo;


    @StartsLine
    private String adminEmailSmtpHost;

    private int adminEmailSmtpPort;

    private String adminEmailUser;

    private String adminEmailPassword;

    private String adminEmailFrom;

    private String adminEmailCC;

    @StartsLine
    private String pop3Host;

    private String pop3User;

    private String pop3Password;

    private String pop3ReboundToEmail;

    @StartsLine
    private boolean clickatellEnabled;
    private String clickatellApiKey;


    @StartsLine
    @TextArea
    private String xslfoForList;

    @TextArea
    private String xslfoForContract;

    @TextArea
    private String xslfoForVoucher;

    @TextArea
    private String xslfoForIssuedInvoice;

    @TextArea
    private String xslfoForWorld;

    @TextArea
    private String xslfoForObject;

    @TextArea
    private String xslfoForTransfersList;

    @TextArea
    private String xslfoForPurchaseOrder;

    @StartsLine
    @TextArea
    private String purchaseOrderTemplate;

    @TextArea
    private String pickupSmsTemplate;

    @TextArea
    private String pickupEmailTemplate;

    @TextArea
    private String pickupSmsTemplateEs;

    public static AppConfig get(EntityManager em) {
        return em.find(AppConfig.class, 1l);
    }

    @Action(name = "Create dummy dates")
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
