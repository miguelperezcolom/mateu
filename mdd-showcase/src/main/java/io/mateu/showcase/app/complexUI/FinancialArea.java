package io.mateu.showcase.app.complexUI;

import io.mateu.mdd.core.annotations.Action;
import org.example.domain.boundaries.common.entities.Person;
import org.example.domain.boundaries.educational.entities.AcademicPlan;
import org.example.domain.boundaries.educational.entities.Classroom;
import org.example.domain.boundaries.educational.entities.Course;
import org.example.domain.boundaries.financial.entities.Invoice;
import org.example.domain.boundaries.financial.entities.InvoiceTag;
import org.example.domain.boundaries.financial.entities.Item;
import org.example.domain.boundaries.financial.entities.Order;

public class FinancialArea {

    @Action
    Class items = Item.class;

    @Action
    Class invoiceTags = InvoiceTag.class;

    @Action
    Class orders = Order.class;

    @Action
    Class invoices = Invoice.class;


}
