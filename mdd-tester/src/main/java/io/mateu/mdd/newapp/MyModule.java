package io.mateu.mdd.newapp;

import io.mateu.mdd.model.authentication.AuthToken;
import io.mateu.mdd.model.authentication.User;
import io.mateu.mdd.model.config.AppConfig;
import io.mateu.mdd.model.finnancials.Actor;
import io.mateu.mdd.model.finnancials.Currency;
import io.mateu.mdd.model.finnancials.Invoice;
import io.mateu.mdd.model.hotelcontract.HotelContract;
import io.mateu.mdd.model.rpc.Hotel;
import io.mateu.mdd.model.rpc.Room;
import io.mateu.mdd.model.rpc.StopSalesListView;
import io.mateu.mdd.model.rpc.StopSalesView;
import io.mateu.mdd.model.tests.basic.Basico;
import io.mateu.mdd.model.tests.herencia.Abstracta;
import io.mateu.mdd.model.tests.multiidioma.Traducido;
import io.mateu.mdd.model.tests.onetomany.Uno;
import io.mateu.mdd.model.tests.onetoone.UnoAUnoMapped;
import io.mateu.mdd.model.tests.onetoone.UnoAUnoMapper;
import io.mateu.mdd.model.tests.owned.Propietario;
import io.mateu.mdd.model.tests.showmethodresult.ConMetodos;
import io.mateu.mdd.model.tests.stereotype.Estereotipado;
import io.mateu.mdd.model.tests.tabs.Tabs;
import io.mateu.mdd.model.tests.usaridparaseleccionar.Referenciador;
import io.mateu.mdd.model.tests.view.*;
import io.mateu.ui.core.client.app.MateuUI;
import io.mateu.ui.core.shared.UserData;
import io.mateu.ui.mdd.server.annotations.Caption;
import io.mateu.ui.mdd.server.interfaces.MDDOpenCRUDAction;
import io.mateu.ui.mdd.server.interfaces.MDDOpenEditorAction;
import io.mateu.ui.mdd.server.interfaces.MDDOpenViewAction;

@Caption("mi módulo")
public class MyModule {

        @Caption("AppConfig")
        MDDOpenEditorAction<AppConfig> a1 = new MDDOpenEditorAction<AppConfig>() {
            @Override
            public Object getId() {
                return 1l;
            }
        };


        MDDOpenCRUDAction<User> a27;

    MDDOpenCRUDAction<AuthToken> a2;

    MDDOpenCRUDAction<Actor> a3;

    MDDOpenCRUDAction<Currency> a4;

    MDDOpenCRUDAction<Invoice> a5;

    MDDOpenCRUDAction<Tabs> a6;

    MDDOpenCRUDAction<ConMetodos> a7;

    MDDOpenCRUDAction<Basico> a8;

    MDDOpenCRUDAction<Referenciador> a9;

    MDDOpenCRUDAction<Uno> a10;

    MDDOpenCRUDAction<Propietario> a11;

    MDDOpenCRUDAction<UnoAUnoMapped> a12;

    MDDOpenCRUDAction<UnoAUnoMapper> a13;

    MDDOpenCRUDAction<HotelContract> a14;

    MDDOpenCRUDAction<Agency> a15;

    MDDOpenCRUDAction<Booking> a16;

    MDDOpenCRUDAction<View1> a17;

    MDDOpenCRUDAction<View2> a18;

    MDDOpenCRUDAction<View3> a19;

    MDDOpenCRUDAction<View4> a20;

    MDDOpenCRUDAction<Estereotipado> a21;

    @Caption("Stop sales")
    MDDOpenViewAction<StopSalesView> a22;

    @Caption("Stop sales from hotel")
    MDDOpenViewAction<StopSalesListView> a23;

    MDDOpenCRUDAction<Abstracta> a24;

    @Caption("Multiidioma")
    MDDOpenCRUDAction<Traducido> a25;

    @Caption("Bookings restricted")
    MDDOpenCRUDAction<Booking> a26 = new MDDOpenCRUDAction<Booking>() {

        @Override
        public String getQueryFilters(UserData user) {
            return "x.agency.id = " + user.get("agencyId");
        }

    };

}
