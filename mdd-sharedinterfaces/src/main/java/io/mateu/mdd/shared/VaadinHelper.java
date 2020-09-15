package io.mateu.mdd.shared;

import com.vaadin.ui.UI;

public class VaadinHelper {

    public static String getAdaptedUIRootPath() {
        String p = UI.getCurrent().getUiRootPath();
        if ("/".equals(p)) {
            p = "";
        } if (!"".equals(p)) {
            if (p.startsWith("/")) p = p.substring(1);
            if (!p.endsWith("/")) p += "/";
        }
        return p;
    }

}
