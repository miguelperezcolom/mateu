package io.mateu.mdd.tester.app.complexCase;

import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.*;
import io.mateu.mdd.core.model.authentication.User;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.tester.model.useCases.bankAccount.BankAccount;
import io.mateu.mdd.tester.model.useCases.bankAccount.Payment;
import io.mateu.mdd.tester.model.useCases.invoicing.Customer;
import io.mateu.mdd.tester.model.useCases.invoicing.Invoice;

import java.util.ArrayList;
import java.util.List;

public class UseCasesModule extends AbstractModule {
    @Override
    public String getName() {
        return "Use cases";
    }

    @Override
    public List<MenuEntry> buildMenu() {
        List<MenuEntry> l = new ArrayList<>();



        l.add(new AbstractMenu("Bank account") {
            @Override
            public List<MenuEntry> buildEntries() {
                List<MenuEntry> l = new ArrayList<>();

                l.add(new MDDOpenCRUDAction("Accounts", BankAccount.class));

                l.add(new MDDOpenCRUDAction("Payments", Payment.class));

                return l;
            }
        });




        l.add(new AbstractMenu("Invoicing") {
            @Override
            public List<MenuEntry> buildEntries() {
                List<MenuEntry> l = new ArrayList<>();


                l.add(new MDDOpenCRUDAction("Customers", Customer.class));

                l.add(new MDDOpenCRUDAction("Invoices", Invoice.class));

                return l;
            }
        });


        l.add(new MDDCallMethodAction("Populate database", UseCasesModule.class, "populate"));


        return l;
    }


    public static void populate() throws Throwable {
        Helper.transact(em -> {
            if (em.createQuery("select x.login from " + User.class.getName() + " x").getResultList().size() == 0) {
                MDD.getApp().getPopulator().populate(MDD.getApp().getAppConfigClass());
            }
        });
    }
}
