package io.mateu.mdd.tester.app.erp;

import com.vaadin.icons.VaadinIcons;
import io.mateu.mdd.core.app.*;
import io.mateu.mdd.core.dev.JPQLTester;
import io.mateu.mdd.tester.model.views.Reserva0;
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

                l.add(new MDDOpenCRUDAction("Agencias", Agencia.class).setColumns("nombre(130),localidad.nombre as 'Localidad'(130),central.nombre as 'Central'"));

                l.add(new MDDMenu("Reservas", "Reservas", new MDDOpenCRUDAction(Reserva.class).setColumns("agencia.nombre,agencia.localidad,leadName,estado,total")));

                l.add(new MDDOpenEditorAction("JPQL", new JPQLTester()));

                return l;
            }
        });
    }
}
