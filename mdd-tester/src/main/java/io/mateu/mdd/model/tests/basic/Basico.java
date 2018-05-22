package io.mateu.mdd.model.tests.basic;

import io.mateu.mdd.model.authentication.User;
import io.mateu.mdd.model.finnancials.Currency;
import io.mateu.ui.core.client.app.MateuUI;
import io.mateu.ui.core.shared.Data;
import io.mateu.ui.core.shared.UserData;
import io.mateu.ui.mdd.server.annotations.*;
import io.mateu.ui.mdd.shared.ActionType;
import io.mateu.ui.mdd.shared.MDDLink;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.Date;

@Entity
@Getter
@Setter
public class Basico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @SearchFilter
    @Help("Full name of the user")
    @NotNull
    private String name = "Hola!!!";

    private int entero;

    private double doble;

    @Temporal(TemporalType.TIMESTAMP)
    private Date date;


    @Temporal(TemporalType.TIMESTAMP)
    @Output
    private Date date2 = new Date();

    @ManyToOne
    @SearchFilterIsNull(value = "Unmapped")
    private Currency moneda;

    @ShowAsHtml("Método")
    public String metodo() {
        return "<h1>Hola!!!</h1>";
    }


    @Action(name = "Test wizard")
    public MDDLink testWizard(@Wizard(MiWizard.class) Data parametros) {
        System.out.println("parametros = " + parametros);
        return new MDDLink(User.class, ActionType.OPENLIST, null);
    }

    @Action(name = "Test wizard 2")
    public MDDLink testWizard2(UserData user, MiWizard wizard) {
        System.out.println("parametros = " + wizard);
        return new MDDLink(User.class, ActionType.OPENLIST, null);
    }

    @Action(name = "Test wizard 3")
    public MDDLink testWizard3(UserData user, MiWizard wizard) throws Throwable {
        System.out.println("parametros = " + wizard);
        throw new Exception("error xxxx");
    }

    @Action(name = "Prueba botón", callOnEnterKeyPressed = true, addAsButton = true)
    public void testBoton() {
        MateuUI.alert("Hola!!!!");
    }


    @Action(name = "Prueba requeridos")
    public void testRequeridos(Data _data) {

        System.out.println(_data);

        MateuUI.alert("Hola!!!!");
    }

}
