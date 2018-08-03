package io.mateu.mdd.tester.model.useCases.invoicing;


import io.mateu.mdd.core.annotations.Output;
import io.mateu.mdd.core.annotations.Sum;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Entity
@Getter
@Setter
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String invoiceNumber;

    @ManyToOne
    @NotNull
    private Customer customer;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "invoice")
    private List<InvoiceLine> lines = new ArrayList<>();


    private double vatPercent;

    @Output
    @Sum
    private BigDecimal vat;

    @Output
    @Sum
    private BigDecimal total;

}
