package io.mateu.mdd.demoadminpanel.infra.in.ui;

import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Help;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.LinkTo;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.NavLink;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LinkSupplier;

/** Showcase of @LinkTo and LinkSupplier: navigation icons at the right side of form fields. */
@UI("/linked-fields")
@Style(StyleConstants.CONTAINER)
public class LinkedFieldsPage implements LinkSupplier {

    @Label("Customer id")
    @Help("The link icon follows this value as you type")
    @LinkTo("/simple?customer=${state.customerId}")
    String customerId = "42";

    @LinkTo(value = "https://mateu.io", title = "Open mateu.io", target = "_blank")
    String website = "mateu.io";

    @Label("Order (link via LinkSupplier)")
    String orderId = "A-1";

    String plain;

    @Override
    public NavLink link(String memberName, HttpRequest httpRequest) {
        if ("orderId".equals(memberName)) {
            return NavLink.builder()
                .href("/simple?order=${state.orderId}")
                .icon("vaadin:cart")
                .title("Open order ${state.orderId}")
                .build();
        }
        return null;
    }

    @Button
    void save() {}
}
