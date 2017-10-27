package io.mateu.mdd.model.tests.basic;

import io.mateu.mdd.model.authentication.User;
import io.mateu.ui.core.shared.Data;
import io.mateu.ui.core.shared.UserData;
import io.mateu.ui.mdd.server.annotations.Action;
import io.mateu.ui.mdd.server.annotations.Output;
import io.mateu.ui.mdd.server.annotations.SearchFilter;
import io.mateu.ui.mdd.server.annotations.Wizard;
import io.mateu.ui.mdd.shared.ActionType;
import io.mateu.ui.mdd.shared.MDDLink;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.util.Date;

@Entity
@Getter
@Setter
public class Basico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @SearchFilter
    private String name;

    private int entero;

    private double doble;

    @Temporal(TemporalType.TIMESTAMP)
    private Date date;


    @Temporal(TemporalType.TIMESTAMP)
    @Output
    private Date date2 = new Date();

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
}
