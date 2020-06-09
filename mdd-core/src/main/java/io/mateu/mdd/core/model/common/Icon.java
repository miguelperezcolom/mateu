package io.mateu.mdd.core.model.common;

import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.annotations.HtmlCol;
import io.mateu.mdd.core.annotations.Output;
import io.mateu.mdd.core.util.Helper;
import lombok.MateuMDDEntity;

import javax.persistence.Id;
import javax.validation.constraints.NotNull;

@MateuMDDEntity
public class Icon {

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
            Helper.transact(em -> {
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
