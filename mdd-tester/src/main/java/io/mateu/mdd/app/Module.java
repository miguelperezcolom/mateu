package io.mateu.mdd.app;

import io.mateu.ui.core.client.app.*;
import io.mateu.ui.core.shared.Data;
import io.mateu.ui.mdd.client.ERPServiceAsync;
import io.mateu.ui.mdd.client.MDDCallback;
import io.mateu.ui.mdd.client.MDDJPACRUDView;
import io.mateu.ui.mdd.shared.ERPService;

import java.util.ArrayList;
import java.util.List;

public class Module extends AbstractModule {
    @Override
    public String getName() {
        return "Module";
    }

    @Override
    public List<MenuEntry> getMenu() {
        List<MenuEntry> m = new ArrayList<>();

        m.add(new AbstractAction("AppConfig") {
            @Override
            public void run() {
                ((ERPServiceAsync) MateuUI.create(ERPService.class)).getMetaData("io.mateu.mdd.model.config.AppConfig", new Callback<Data>() {
                    @Override
                    public void onSuccess(Data result) {
                        MateuUI.openView(new MDDJPACRUDView(result).getNewEditorView().setInitialId(1l));
                    }
                });
            }
        });

        m.add(new AbstractAction("Users") {
            @Override
            public void run() {
                ((ERPServiceAsync)MateuUI.create(ERPService.class)).getMetaData("io.mateu.mdd.model.authentication.User", new MDDCallback());
            }
        });

        m.add(new AbstractAction("Auth tokens") {
            @Override
            public void run() {
                ((ERPServiceAsync)MateuUI.create(ERPService.class)).getMetaData("io.mateu.mdd.model.authentication.AuthToken", new MDDCallback());
            }
        });


        m.add(new AbstractAction("Actors") {
            @Override
            public void run() {
                ((ERPServiceAsync)MateuUI.create(ERPService.class)).getMetaData("io.mateu.mdd.model.finnancials.Actor", new MDDCallback());
            }
        });

        m.add(new AbstractAction("Cuurencies") {
            @Override
            public void run() {
                ((ERPServiceAsync)MateuUI.create(ERPService.class)).getMetaData("io.mateu.mdd.model.finnancials.Currency", new MDDCallback());
            }
        });


        m.add(new AbstractAction("Invoices") {
            @Override
            public void run() {
                ((ERPServiceAsync)MateuUI.create(ERPService.class)).getMetaData("io.mateu.mdd.model.finnancials.Invoice", new MDDCallback());
            }
        });

        m.add(new AbstractAction("Tabs") {
            @Override
            public void run() {
                ((ERPServiceAsync)MateuUI.create(ERPService.class)).getMetaData("io.mateu.mdd.model.tests.tabs.Tabs", new MDDCallback());
            }
        });

        m.add(new AbstractAction("OneToMany") {
            @Override
            public void run() {
                ((ERPServiceAsync)MateuUI.create(ERPService.class)).getMetaData("io.mateu.mdd.model.tests.onetomany.Uno", new MDDCallback());
            }
        });

        m.add(new AbstractAction("Owned") {
            @Override
            public void run() {
                ((ERPServiceAsync)MateuUI.create(ERPService.class)).getMetaData("io.mateu.mdd.model.tests.owned.Propietario", new MDDCallback());
            }
        });


        m.add(new AbstractAction("OneToOne mapped") {
            @Override
            public void run() {
                ((ERPServiceAsync)MateuUI.create(ERPService.class)).getMetaData("io.mateu.mdd.model.tests.onetoone.UnoAUnoMapped", new MDDCallback());
            }
        });

        m.add(new AbstractAction("OneToOne mapper") {
            @Override
            public void run() {
                ((ERPServiceAsync)MateuUI.create(ERPService.class)).getMetaData("io.mateu.mdd.model.tests.onetoone.UnoAUnoMapper", new MDDCallback());
            }
        });


        m.add(new AbstractAction("Contracts") {
            @Override
            public void run() {
                ((ERPServiceAsync)MateuUI.create(ERPService.class)).getMetaData("io.mateu.mdd.model.hotelcontract.HotelContract", new MDDCallback());
            }
        });

        return m;
    }
}
