package io.mateu.mdd.tester.model.useCases.batches;

import com.google.common.base.Strings;
import io.mateu.mdd.core.annotations.Ignored;
import io.mateu.mdd.core.annotations.Money;
import io.mateu.mdd.core.model.authentication.User;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.ManyToOne;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class TicketBatchLine {

    @Ignored
    private UUID uuid = UUID.randomUUID();

    @Override
    public boolean equals(Object obj) {
        return this == obj || (obj != null && obj instanceof TicketBatchLine && uuid.equals(((TicketBatchLine) obj).getUuid()));
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Ignored
    private final TicketBatchForm form;

    @ManyToOne
    private User provider;

    private String service;

    private LocalDate date;

    @Money
    private Double value;

    @Money
    private Double cash;

    @Money
    private Double creditCard;

    private String voucher;

    @ManyToOne
    private User rep;

    private String comments;

    @Ignored
    private BatchFreeTextLine batchLine;


    public void setValue(Double value) {
        this.value = value;
        form.updateTotals();
    }

    public void setCash(Double cash) {
        this.cash = cash;
        form.updateTotals();
    }

    public void setCreditCard(Double creditCard) {
        this.creditCard = creditCard;
        form.updateTotals();
    }

    public TicketBatchLine(TicketBatchForm form, BatchFreeTextLine batchLine) {
        this.form = form;
        this.batchLine = batchLine;
        provider = batchLine.getProvider();
        service = batchLine.getService();
        date = batchLine.getDate();
        value = batchLine.getValue();
        cash = batchLine.getCash();
        creditCard = batchLine.getCreditCard();
        voucher = batchLine.getVoucher();
        rep = batchLine.getProvider();
        comments = batchLine.getComments();
        form.updateTotals();
    }

    public TicketBatchLine(TicketBatchForm form) {
        this.form = form;
    }

    public boolean isEmpty() {
        boolean e = false;
        e |= provider != null;
        e |= !Strings.isNullOrEmpty(service);
        e |= date != null;
        e |= value != null;
        e |= cash != null;
        e |= creditCard != null;
        e |= !Strings.isNullOrEmpty(voucher);
        e |= rep != null;
        e |= !Strings.isNullOrEmpty(comments);
        return !e;
    }
}
