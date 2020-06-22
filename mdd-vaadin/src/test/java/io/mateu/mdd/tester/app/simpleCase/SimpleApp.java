package io.mateu.mdd.tester.app.simpleCase;

import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.Component;
import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.annotations.Caption;
import io.mateu.mdd.core.annotations.IFrame;
import io.mateu.mdd.core.annotations.SubApp;
import io.mateu.mdd.core.app.*;
import io.mateu.mdd.core.model.authentication.User;
import io.mateu.mdd.core.model.common.Icon;
import io.mateu.mdd.core.model.config.AppConfig;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.test.model.Entidad;
import io.mateu.mdd.test.model.EntidadReferenciada;
import io.mateu.mdd.test.model.Reloj;
import io.mateu.mdd.tester.model.entities.basic.BasicFieldsDemoEntity;
import io.mateu.mdd.tester.model.entities.dependant.Address;
import io.mateu.mdd.tester.model.entities.groups.Person;
import io.mateu.mdd.tester.model.useCases.batches.Batch;
import io.mateu.mdd.tester.model.useCases.hotel.Booking;
import io.mateu.mdd.tester.model.useCases.ofertas.Oferta;
import io.mateu.mdd.tester.model.useCases.reservas.CapturedBooking;
import io.mateu.mdd.tester.model.useCases.reservas.File1;
import io.mateu.mdd.tester.model.useCases.hotel.cockpit.CockpitView;
import io.mateu.mdd.tester.model.useCases.hotel.HotelSalesControlView;
import io.mateu.mdd.tester.model.useCases.showcase.Showcase;
import io.mateu.mdd.tester.model.views.BookingsCrudView;
import io.mateu.mdd.tester.model.views.BookingsView;
import io.mateu.mdd.tester.model.wizards.Wizard1Page1;
import io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders.AbstractFieldBuilder;
import lombok.extern.slf4j.Slf4j;

import javax.validation.constraints.NotEmpty;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.List;

@Caption("My simple app")
@Slf4j
public class SimpleApp extends SimpleMDDApplication {



    @Action(order = -100)
    public Class appconfig() {
        return AppConfig.class;
    }


    @Action(order = -50)
    public Class users() {
        return User.class;
    }


    @Action(value = "Say hello", order = -40)
    public String hello(@NotEmpty String name) {
        return "Hello " + name + "!";
    }


    @Action(order = -30)
    public Class people() {
        return Person.class;
    }


    @Action(order = -20)
    public Class showcase() {
        return Showcase.class;
    }

    @Action(order = 2)
    public AbstractAction maintainEntities() {
        return new MDDOpenCRUDAction(BasicFieldsDemoEntity.class);
    }


    @SubApp(order = 3)
    public SubMenu aSubMenu() {
        return new SubMenu();
    }

    @Action(order = 4)
    public List<MenuEntry> anotherSubMenu() {
        return Lists.newArrayList(new AbstractAction("Say hello") {
            @Override
            public void run() {
                System.out.println("hello");
            }
        }, new AbstractAction("Say bye") {
            @Override
            public void run() {
                System.out.println("bye");
            }
        }, new MDDOpenCRUDAction(Entidad.class));
    }

    @Action(order = 5)
    public String repeat(String string, int count) {
        return Strings.repeat(string, count);
    }


    @Action(order = 6)
    public String md5(String s) {
        return Helper.md5(s);
    }

    @Action(order = 7)
    public String getThreadName() {
        return Thread.currentThread().getName();
    }

    @Action(order = 8)
    public String ls() throws IOException, InterruptedException {
        return Helper.toHtml(Helper.runCommand("ls -lh"));
    }


    @Action(order = 9)
    public String df() throws IOException, InterruptedException {
        return Helper.toHtml(Helper.runCommand("df -h"));
    }

    @Action(order = 10, icon = VaadinIcons.CART)
    public Class bookings() {
        return Booking.class;
    }

    @Action(order = 11, icon = VaadinIcons.CART)
    public BookingsView bookingsView() {
        return new BookingsView();
    }

    @Action(order = 12, icon = VaadinIcons.CART)
    public BookingsCrudView bookingsCrudView() {
        return new BookingsCrudView();
    }

    @Action(order = 13, icon = VaadinIcons.FOLDER)
    public Class files1() {
        return File1.class;
    }

    @Action(order = 15, icon = VaadinIcons.EURO)
    public Class ofertas() {
        return Oferta.class;
    }

    @Action(order = 20, icon = VaadinIcons.PICTURE)
    public Class icons() {
        return Icon.class;
    }

    @Action(order = 30, icon = VaadinIcons.FOLDER_ADD)
    public Class captured() {
        return CapturedBooking.class;
    }

    @Action(order = 50)
    public Vista vista() {
        return new Vista();
    }

    @Action(order = 60)
    public Vista2 vista2() {
        return new Vista2();
    }

    @Action(order = 90, icon = VaadinIcons.FILE)
    public Class batches() {
        return Batch.class;
    }

    @Action(order = 95, icon = VaadinIcons.TABLE)
    public Class entidades() {
        return Entidad.class;
    }

    @Action(order = 96, icon = VaadinIcons.FILE_TABLE)
    public Class entidadesReferenciadas() {
        return EntidadReferenciada.class;
    }

    @Action(order = 100, icon = VaadinIcons.CLOUD)@IFrame
    public URL url() {
        try {
            return new URL("https://elpais.com/");
        } catch (MalformedURLException e) {
            e.printStackTrace();
        }
        return null;
    }

    @Action(order = 110, icon = VaadinIcons.TREE_TABLE)
    public Component misssionControl() {
        return new HotelSalesControlView();
    }

    @Action(order = 115, icon = VaadinIcons.GAMEPAD)
    public Component cockpit() {
        return new CockpitView();
    }

    @Action(order = 120, icon = VaadinIcons.STOPWATCH)@IFrame
    public Object reloj() throws Throwable {
        return new Reloj();
    }

    @Action(order = 130)
    public Wizard1Page1 wizard() {
        return new Wizard1Page1();
    }

    @Action(order = 140)
    public Class addresses() {
        return Address.class;
    }

    @Action(order = 150, icon = VaadinIcons.FILE)
    public Class files() {
        return File1.class;
    }


    @Override
    public boolean isAuthenticationNeeded() {
        return false;
    }

    @Override
    public boolean isOAuthAllowed() {
        return false;
    }

    @Override
    public AbstractFieldBuilder getFieldBuilder(FieldInterfaced field) {
        return super.getFieldBuilder(field);
    }


    @Override
    public Searcher getSearcher() {
        return new SimpleSearcher();
    }
}
