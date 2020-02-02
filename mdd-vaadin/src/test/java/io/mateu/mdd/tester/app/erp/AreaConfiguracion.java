package io.mateu.mdd.tester.app.erp;

import io.mateu.mdd.core.app.*;

import java.util.ArrayList;
import java.util.List;

public class AreaConfiguracion extends AbstractArea {
    public AreaConfiguracion() {
        super("Configuración");
    }

    @Override
    public List<AbstractModule> buildModules() {
        return List.of(new AbstractModule() {
            @Override
            public String getName() {
                return "Configuración";
            }

            @Override
            public List<MenuEntry> buildMenu() {
                List<MenuEntry> l = new ArrayList<>();

                l.add(new MDDMenu("Mundo", "Países", Pais.class, "Provincias", Provincia.class, "Localidades", Localidad.class));

                return l;
            }
        });
    }
}
