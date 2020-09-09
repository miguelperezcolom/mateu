package io.mateu.mdd.tester.app.erp;

import com.vaadin.icons.VaadinIcons;
import io.mateu.mdd.core.app.*;
import io.mateu.mdd.core.dev.JPQLTester;
import io.mateu.mdd.tester.model.useCases.bankAccount.Bank;
import io.mateu.mdd.tester.model.useCases.bankAccount.BankAccount;
import io.mateu.mdd.vaadinport.vaadin.navigation.MDDViewComponentCreator;

import java.util.ArrayList;
import java.util.List;

public class AreaReservas extends AbstractArea {
    public AreaReservas() {
        super("Call center");
    }

    @Override
    public VaadinIcons getIcon() {
        return VaadinIcons.HEADSET;
    }

    @Override
    public List<AbstractModule> buildModules() {
        return List.of(new AbstractModule() {
            @Override
            public String getName() {
                return "Reservas";
            }

            @Override
            public List<MenuEntry> buildMenu() {
                List<MenuEntry> l = new ArrayList<>();

                l.add(new MDDOpenCRUDAction("Agencias", Agencia.class).setColumns("nombre(130),localidad.nombre as 'Localidad'(130),central.nombre as 'Central',del,al"));

                l.add(new MDDOpenCRUDAction("Serials", OfficeSerial.class));

                l.add(new MDDOpenCRUDAction("Banks", Bank.class));

                l.add(new MDDOpenCRUDAction("Accounts", BankAccount.class));

                l.add(new MDDOpenCRUDAction("Excursiones", Excursion.class));

                l.add(new MDDMenu("Reservas", "Reservas", new MDDOpenCRUDAction(Reserva.class).setColumns("agencia.nombre,agencia.localidad,leadName,estado,total"), "Markups", Markup.class, "Vista", VistaReservas.class));

                l.add(new MDDOpenEditorAction("JPQL", new JPQLTester()));

                return l;
            }
        });
    }
}
