package io.mateu.mdd.tester.app.erp;

import io.mateu.mdd.core.app.*;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.tester.model.entities.relations.ManyToManyASideEntity;
import io.mateu.mdd.tester.model.entities.relations.ManyToManyBSideEntity;

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

                l.add(new MDDMenu("Mundo", "Mundos", Mundo.class, "Países", Pais.class, "Provincias", Provincia.class, "Localidades", Localidad.class));


                l.add(new MDDMenu("ManyToMany", "Lado A", ManyToManyASideEntity.class, "Lado B", ManyToManyBSideEntity.class));

                l.add(new AbstractAction("Limpiar caché") {
                    @Override
                    public void run(MDDExecutionContext context) throws Exception {

                        Helper.getEMF().getCache().evictAll();

                    }
                });

                return l;
            }
        });
    }
}
