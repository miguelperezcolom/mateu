package io.mateu.mdd.tester.app.club;


import io.mateu.mdd.core.annotations.*;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.MDDOpenCRUDAction;
import io.mateu.mdd.core.app.MDDOpenEditorAction;
import io.mateu.mdd.core.app.SimpleMDDApplication;
import io.mateu.mdd.core.model.config.AppConfig;
import io.mateu.mdd.tester.app.club.model.Pago;
import io.mateu.mdd.tester.app.club.model.Servicio;
import io.mateu.mdd.tester.app.club.model.Socio;
import io.mateu.mdd.tester.app.club.model.Subscripcion;

@Caption("Ermassets")
@MateuMDDApp(path = "/club")
public class MyApp extends SimpleMDDApplication {

    @Action(order = 1)
    public AbstractAction socios() {
        return new MDDOpenCRUDAction(Socio.class);
    }

    @Action(order = 2)
    public AbstractAction servicios() {
        return new MDDOpenCRUDAction(Servicio.class);
    }

    @Action(order = 3)
    public AbstractAction subscripciones() {
        return new MDDOpenCRUDAction(Subscripcion.class);
    }

    @Action(order = 4)
    public AbstractAction pagos() {
        return new MDDOpenCRUDAction(Pago.class);
    }

    @Action(order = 5)
    @Private(permissions = {1})
    public AbstractAction configuracion() {
        return new MDDOpenEditorAction("", AppConfig.class, 1l);
    }

    @Action(order = 6)
    @Public
    public String saludar(String tuNombre) {
        return "Hola " + tuNombre;
    }


    @Override
    public boolean isAuthenticationNeeded() {
        return true;
    }
}