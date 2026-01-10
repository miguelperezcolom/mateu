package com.example.demo.ddd.infra.in.ui.financial;

import com.example.demo.ddd.infra.in.ui.product.pages.hotel.Files;
import io.mateu.uidl.annotations.Menu;

public class FinancialSubmenu {
    @Menu
    Files invoices;

    @Menu
    Files payments;

    @Menu
    Files accounts;
}
