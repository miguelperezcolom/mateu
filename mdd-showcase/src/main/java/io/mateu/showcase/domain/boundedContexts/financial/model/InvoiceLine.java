package io.mateu.showcase.domain.boundedContexts.financial.model;

import lombok.MateuMDDEntity;

@MateuMDDEntity
public class InvoiceLine {

    private final String itemName;

    private final double itemPrice;

    private final double quantity;

    private final double total;

}
