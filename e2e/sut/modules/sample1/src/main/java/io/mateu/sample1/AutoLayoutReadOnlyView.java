package io.mateu.sample1;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.FieldStereotype;
import lombok.Getter;
import lombok.Setter;

@UI("/auto-layout-tabs")
@Title("Customer 360")
@AutoLayout
@ReadOnly
@Getter
@Setter
public class AutoLayoutReadOnlyView {

    @Section("Profile")
    @Stereotype(FieldStereotype.textarea)
    String summary = "ACME Corp, enterprise customer since 2019. Main contact: Jane Smith.";

    @Stereotype(FieldStereotype.textarea)
    String address = "Gran Via 1\n07001 Palma\nSpain";

    @Section("Billing")
    @Stereotype(FieldStereotype.textarea)
    String billingTerms = "Net 30, bank transfer. VAT ESB12345678.";

    @Stereotype(FieldStereotype.textarea)
    String billingHistory = "12 invoices in 2026, all paid on time.";

    @Section("Shipping")
    @Stereotype(FieldStereotype.textarea)
    String shippingAddress = "Warehouse 4, Poligono Son Castello\n07009 Palma\nSpain";

    @Stereotype(FieldStereotype.textarea)
    String shippingNotes = "Deliveries only before noon. Call 30 minutes ahead.";

    @Section("Activity")
    @Stereotype(FieldStereotype.textarea)
    String lastOrders = "ORD-1041 (2026-06-28), ORD-1017 (2026-06-02), ORD-0993 (2026-05-11).";

    @Stereotype(FieldStereotype.textarea)
    String openTickets = "TCK-221: damaged pallet on ORD-1017 (pending refund).";

    @Section("Notes")
    @Stereotype(FieldStereotype.textarea)
    String accountNotes = "Renewal conversation planned for September.";

    @Stereotype(FieldStereotype.textarea)
    String internalNotes = "Prefers email over phone. Spanish invoices.";

}
