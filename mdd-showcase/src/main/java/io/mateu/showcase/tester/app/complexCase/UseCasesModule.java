package io.mateu.showcase.tester.app.complexCase;

import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.*;
import io.mateu.mdd.core.model.authentication.User;
import io.mateu.mdd.core.model.config.AppConfig;
import io.mateu.mdd.util.Helper;
import io.mateu.showcase.tester.model.useCases.bankAccount.BankAccount;
import io.mateu.showcase.tester.model.useCases.bankAccount.Payment;
import io.mateu.showcase.tester.model.useCases.hotel.*;
import io.mateu.showcase.tester.model.useCases.hotel.cockpit.CockpitView;
import io.mateu.showcase.tester.model.useCases.invoicing.Agent;
import io.mateu.showcase.tester.model.useCases.invoicing.Customer;
import io.mateu.showcase.tester.model.useCases.invoicing.Invoice;
import io.mateu.showcase.tester.model.useCases.pojos.Calculator;
import io.mateu.showcase.tester.model.views.BookingsView;

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

                l.add(new MDDOpenCRUDAction("Agents", Agent.class));

                l.add(new MDDOpenCRUDAction("Invoices", Invoice.class));

                return l;
            }
        });


        l.add(new AbstractMenu("Hotel") {
            @Override
            public List<MenuEntry> buildEntries() {
                List<MenuEntry> l = new ArrayList<>();


                l.add(new MDDOpenCRUDAction("Hotels", Hotel.class));

                l.add(new MDDOpenCRUDAction("Rooms", Room.class));

                l.add(new MDDOpenCRUDAction("Offers", AbstractOffer.class));

                l.add(new MDDOpenCRUDAction("Contracts", Contract.class));

                l.add(new MDDOpenCRUDAction("Bookings", Booking.class));

                l.add(new MDDOpenListViewAction("Bookings view", BookingsView.class));

                l.add(new MDDOpenListViewAction("Roomings", RoomingListView.class));

                return l;
            }
        });


        l.add(new AbstractMenu("POJOs") {
            @Override
            public List<MenuEntry> buildEntries() {
                List<MenuEntry> l = new ArrayList<>();

                l.add(new MDDOpenEditorAction("Calculator", Calculator.class));

                return l;
            }
        });

        l.add(new MDDOpenCustomComponentAction("Cockpit", CockpitView.class));

        l.add(new MDDOpenEditorAction("App config", AppConfig.class, 1l));

        l.add(new MDDCallMethodAction("Populate database", UseCasesModule.class, "populate"));

        l.add(new AbstractAction("Test object editor") {
            @Override
            public void run() {
                try {
                    MDD.edit(Helper.find(AppConfig.class, 1l));
                } catch (Throwable throwable) {
                    MDD.alert(throwable);
                }
            }
        });

        l.add(new AbstractAction("Test object editor 2") {
            @Override
            public void run() {
                try {
                    MDD.edit(Helper.find(BankAccount.class, 1l));
                } catch (Throwable throwable) {
                    MDD.alert(throwable);
                }
            }
        });

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
