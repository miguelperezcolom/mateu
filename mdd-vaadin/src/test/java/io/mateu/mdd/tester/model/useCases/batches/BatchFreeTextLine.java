package io.mateu.mdd.tester.model.useCases.batches;

import com.google.common.base.Strings;
import io.mateu.mdd.core.annotations.Output;
import io.mateu.mdd.core.model.authentication.User;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;

@Entity
@Getter
@Setter
public class BatchFreeTextLine {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne@NotNull
    private Batch batch;

    @ManyToOne
    private User provider;

    private String service;

    private LocalDate date;

    private Double value;

    private Double cash;

    private Double creditCard;

    private String voucher;

    @ManyToOne
    private User rep;

    private String comments;

    @Output
    private Double cost;

    public BatchFreeTextLine() {
    }

    public BatchFreeTextLine(TicketBatchLine l) {
        update(l);
    }

    public void update(TicketBatchLine l) {
        provider = l.getProvider();
        service = l.getService();
        date = l.getDate();
        value = l.getValue();
        cash = l.getCash();
        creditCard = l.getCreditCard();
        voucher = l.getVoucher();
        rep = l.getRep();
        comments = l.getComments();
    }



    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public boolean equals(Object obj) {
        return this == obj || (obj != null  && id > 0 && obj instanceof BatchFreeTextLine && id == ((BatchFreeTextLine) obj).getId());
    }

    @Override
    public String toString() {
        return "Batch free text line " + id;
    }

    public void check(int i) throws Throwable {
        boolean e = false;
        e |= provider == null;
        e |= Strings.isNullOrEmpty(service);
        e |= date == null;
        e |= value == null;
        e |= cash == null;
        e |= creditCard == null;
        e |= Strings.isNullOrEmpty(voucher);
        e |= rep == null;
        e |= Strings.isNullOrEmpty(comments);
        if (e) throw  new Error("Line " + (i + 1) + " is incomplete. All lines mut be complete before closing this batch");
    }
}
