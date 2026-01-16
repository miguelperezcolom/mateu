package com.example.demo.ddd.infra.in.ui.financial;

import com.example.demo.ddd.infra.in.ui.financial.pages.Accounts;
import com.example.demo.ddd.infra.in.ui.financial.pages.Invoices;
import com.example.demo.ddd.infra.in.ui.financial.pages.Payments;
import io.mateu.uidl.annotations.Menu;

public class FinancialSubmenu {
    @Menu
    Invoices invoices;

    @Menu
    Payments payments;

    @Menu
    Accounts accounts;
}
