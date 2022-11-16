package io.mateu.i18n;

import com.vaadin.ui.UI;

import java.util.Locale;
import java.util.ResourceBundle;

public class Translator {

    static ResourceBundle es;
    static ResourceBundle en;
    static ResourceBundle it;
    static ResourceBundle de;
    static ResourceBundle fr;
    static ResourceBundle ru;
    static ResourceBundle ar;
    static ResourceBundle cz;

    static {
        try {
            es = ResourceBundle.getBundle("messages", new Locale("es"));
            en = ResourceBundle.getBundle("messages", new Locale("en"));
            it = ResourceBundle.getBundle("messages", new Locale("it"));
            de = ResourceBundle.getBundle("messages", new Locale("de"));
            fr = ResourceBundle.getBundle("messages", new Locale("fr"));
            ru = ResourceBundle.getBundle("messages", new Locale("ru"));
            ar = ResourceBundle.getBundle("messages", new Locale("ar"));
            cz = ResourceBundle.getBundle("messages", new Locale("cz"));
        } catch (Exception e) {
            System.out.println("Translations not available: " + e.getMessage());
        }
    }

    public static String translate(String text) {
        String l = null;
        String traduccion = text;
        if (UI.getCurrent() != null) {
            l = (String) UI.getCurrent().getSession().getAttribute("__language");
        }
        if (l == null) l = Locale.getDefault().getLanguage();
        ResourceBundle traducciones = null;
        if ("es".equals(l)) traducciones = es;
        if ("en".equals(l)) traducciones = en;
        if ("it".equals(l)) traducciones = it;
        if ("de".equals(l)) traducciones = de;
        if ("fr".equals(l)) traducciones = fr;
        if ("ru".equals(l)) traducciones = ru;
        if ("ar".equals(l)) traducciones = ar;
        if ("cz".equals(l)) traducciones = cz;
        if (traducciones != null && traducciones.containsKey(text)) traduccion = traducciones.getString(text);
        return traduccion != null?traduccion:text;
    }

}
