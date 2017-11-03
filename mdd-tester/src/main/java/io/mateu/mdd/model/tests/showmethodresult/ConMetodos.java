package io.mateu.mdd.model.tests.showmethodresult;

import io.mateu.mdd.model.authentication.User;
import io.mateu.ui.mdd.server.annotations.Output;
import io.mateu.ui.mdd.server.annotations.SearchFilter;
import io.mateu.ui.mdd.server.annotations.Show;
import io.mateu.ui.mdd.server.annotations.ShowAsHtml;
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
public class ConMetodos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @SearchFilter
    private String name;

    @NotNull
    private int entero;

    private double doble;

    @Temporal(TemporalType.TIMESTAMP)
    private Date date;


    @Temporal(TemporalType.TIMESTAMP)
    @Output
    private Date date2 = new Date();

    @Show("Abrir lista usuarios")
    public MDDLink test1() {
        return new MDDLink(User.class, ActionType.OPENLIST, null);
    }

    @Show("Texto")
    public String test2() {
        return "Hola!!!";
    }

    @ShowAsHtml("Esto es html")
    public String test3() {
        return "<b>Prueba html</b>\n" +
                "<table>\n" +
                "  <th>\n" +
                "    <td>Aaaa</td>\n" +
                "    <td>Bbb</td>\n" +
                "    <td>Total</td>\n" +
                "  </th>\n" +
                "  <tr>\n" +
                "    <td>AAA</td>\n" +
                "    <td>BBB</td>\n" +
                "    <td>CCCC</td>\n" +
                "  </tr>\n" +
                "</table>\n" +
                "\n" +
                "<p></p>\n" +
                "<p>Loren ipsum ....</p>";
    }

}
