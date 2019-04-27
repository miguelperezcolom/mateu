package io.mateu.mdd.tester.model.useCases.invoicing;


import io.mateu.mdd.core.annotations.FullWidth;
import io.mateu.mdd.core.annotations.Output;
import io.mateu.mdd.core.annotations.Sum;
import io.mateu.mdd.core.annotations.ColumnWidth;
import io.mateu.mdd.core.util.Helper;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ColumnWidth(150)
    @NotEmpty
    private String invoiceNumber;

    @ManyToOne
    @NotNull
    private Customer customer;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "invoice", orphanRemoval = true)
    @FullWidth
    private List<InvoiceLine> lines = new ArrayList<>();

    public void setLines(List<InvoiceLine> lines) {
        this.lines = lines;
        updateTotals();
    }


    private double vatPercent;

    @Output
    @Sum
    private BigDecimal vat;

    @Output
    @Sum(caption = "Total")
    private BigDecimal total;


    public void setVatPercent(double vatPercent) {
        this.vatPercent = vatPercent;
        updateTotals();
    }


    public void updateTotals() {
        double t = 0;
        for (InvoiceLine l :lines) t += l.getAmount();

        setVat(new BigDecimal("" + Helper.roundEuros(t * vatPercent / 100d)));

        setTotal(new BigDecimal("" + Helper.roundEuros(t + vat.doubleValue())));
    }
}
