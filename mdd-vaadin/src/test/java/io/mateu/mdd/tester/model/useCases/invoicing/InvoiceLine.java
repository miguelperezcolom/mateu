package io.mateu.mdd.tester.model.useCases.invoicing;


import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Getter
@Setter
public class InvoiceLine {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne
    private Invoice invoice;

    private String description;

    private double amount;


    public void setAmount(double amount) {
        this.amount = amount;
        if (invoice != null) invoice.updateTotals();
    }


    @Override
    public boolean equals(Object obj) {
        return this == obj || (id > 0 && obj instanceof InvoiceLine && id == ((InvoiceLine) obj).getId());
    }
}
