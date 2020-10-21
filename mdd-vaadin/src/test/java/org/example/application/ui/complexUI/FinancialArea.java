package org.example.application.ui.complexUI;

import io.mateu.mdd.shared.annotations.Columns;
import io.mateu.mdd.shared.annotations.EditableFields;
import io.mateu.mdd.shared.annotations.FilterFields;
import io.mateu.mdd.shared.annotations.MenuOption;
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
    @FilterFields("id,recipient")
    @Columns("id,recipient,total,dueDate")
    @EditableFields("id,recipient,total,dueDate, paid, date")
    Class invoices = Invoice.class;


}
