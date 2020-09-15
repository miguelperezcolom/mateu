package io.mateu.showcase.domain.boundedContexts.financial.model;

import lombok.MateuMDDEntity;

import javax.persistence.ManyToOne;
import javax.validation.constraints.NotNull;

@MateuMDDEntity
public class OrderLine {

    @ManyToOne@NotNull
    private Item item;

    private double quantity;

    @ManyToOne
    private InvoiceLine invoiceLine;
}
