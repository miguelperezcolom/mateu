package io.mateu.showcase.app.complexUI;

import io.mateu.mdd.core.annotations.MenuOption;
import org.example.domain.boundaries.financial.entities.*;

public class FinancialArea {

    @MenuOption
    Class financialAgents = FinancialAgent.class;

    @MenuOption
    Class items = Item.class;

    @MenuOption
    Class invoiceTags = InvoiceTag.class;

    @MenuOption
    Class orders = Order.class;

    @MenuOption
    Class invoices = Invoice.class;


}
