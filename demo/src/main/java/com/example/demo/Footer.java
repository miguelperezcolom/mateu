package com.example.demo;

import com.vaadin.server.ExternalResource;
import com.vaadin.ui.*;

public class Footer extends HorizontalLayout {

    public Footer() {
        addStyleName("footer");
        setWidthFull();
        CssLayout left;
        addComponent(left = new CssLayout());
        left.addComponent(new Link("Data protection", new ExternalResource("")));
        left.addComponent(new Link("Terms & conditions", new ExternalResource("")));
        left.addComponent(new Link("Imprint", new ExternalResource("")));
        left.addComponent(new Link("Cookie Settings", new ExternalResource("")));

        Label right;
        addComponent(right = new Label("2022 © guifox Bookings AG. All rights reserved."));
        setComponentAlignment(left, Alignment.MIDDLE_LEFT);
        setComponentAlignment(right, Alignment.MIDDLE_RIGHT);
        setExpandRatio(left, 1);

    }


}
