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
import io.mateu.ui.mdd.server.interfaces.Module;

@Caption("mi módulo")
public class MyModule implements Module {

        @Caption("AppConfig")
        public MDDOpenEditorAction<AppConfig> a1 = new MDDOpenEditorAction<AppConfig>() {
            @Override
            public Object getId() {
                return 1l;
            }
        };


    public MDDOpenCRUDAction<User> a27;

    public MDDOpenCRUDAction<AuthToken> a2;

    public MDDOpenCRUDAction<Actor> a3;

    public MDDOpenCRUDAction<Currency> a4;

    public MDDOpenCRUDAction<Invoice> a5;

    public MDDOpenCRUDAction<Tabs> a6;

    public MDDOpenCRUDAction<ConMetodos> a7;

    public MDDOpenCRUDAction<Basico> a8;

    public MDDOpenCRUDAction<Referenciador> a9;

    public MDDOpenCRUDAction<Uno> a10;

    public MDDOpenCRUDAction<Propietario> a11;

    public MDDOpenCRUDAction<UnoAUnoMapped> a12;

    public MDDOpenCRUDAction<UnoAUnoMapper> a13;

    public MDDOpenCRUDAction<HotelContract> a14;

    public MDDOpenCRUDAction<Agency> a15;

    public MDDOpenCRUDAction<Booking> a16;

    public MDDOpenCRUDAction<View1> a17;

    public MDDOpenCRUDAction<View2> a18;

    public MDDOpenCRUDAction<View3> a19;

    public MDDOpenCRUDAction<View4> a20;

    public MDDOpenCRUDAction<Estereotipado> a21;

    @Caption("Stop sales")
    public MDDOpenViewAction<StopSalesView> a22;

    @Caption("Stop sales from hotel")
    public MDDOpenViewAction<StopSalesListView> a23;

    public MDDOpenCRUDAction<Abstracta> a24;

    @Caption("Multiidioma")
    public MDDOpenCRUDAction<Traducido> a25;

    @Caption("Bookings restricted")
    public MDDOpenCRUDAction<Booking> a26 = new MDDOpenCRUDAction<Booking>() {

        @Override
        public String getQueryFilters(UserData user) {
            return "x.agency.id = " + user.get("agencyId");
        }

    };

}
