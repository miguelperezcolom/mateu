package io.mateu.mdd.core.model.common;

import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.HtmlCol;
import io.mateu.mdd.shared.annotations.Output;
import io.mateu.util.Helper;
import io.mateu.util.interfaces.IIcon;
import io.mateu.util.persistence.JPAHelper;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.validation.constraints.NotNull;

@Entity
@Getter
@Setter
@EqualsAndHashCode(of = "id")
public class Icon implements IIcon {

    @Id
    private String id;

    @Output@HtmlCol
    private transient String html;

    public String getHtml() {
        return toString();
    }

    @Override
    public String toString() {
        return "<i class='fas fa-" + id + "'></i>";
    }

    public static void createDefaultSet() {
        try {
            rebuild(Helper.leerFichero(Icon.class.getResourceAsStream("/icons/fontawesome.css")));
        } catch (Throwable e) {
            e.printStackTrace();
        }
    }

    @Action
    public static void load(@NotNull Resource file) throws Throwable {
        String css = new String(file.getBytes());
        rebuild(css);
    }

    private static void rebuild(String css) throws Throwable {
        if (css != null) {
            JPAHelper.transact(em -> {
                for (String l : css.split("\n")) {
                    if (l.contains(":before")) {
                        try {
                            System.out.println(l);
                            String id = l.substring(l.indexOf("-") + 1, l.indexOf(":"));
                            System.out.println("id=" + id);
                            Icon i = em.find(Icon.class, id);
                            if (i == null) {
                                i = new Icon();
                                i.setId(id);
                                em.persist(i);
                            }
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    }
                }
            });
        }
    }

}
