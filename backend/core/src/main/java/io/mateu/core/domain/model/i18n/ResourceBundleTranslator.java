package io.mateu.core.domain.model.i18n;

import java.util.Locale;
import java.util.ResourceBundle;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class ResourceBundleTranslator implements Translator {

  ResourceBundle es;
  ResourceBundle en;
  ResourceBundle it;
  ResourceBundle de;
  ResourceBundle fr;
  ResourceBundle ru;
  ResourceBundle ar;
  ResourceBundle cz;

  public ResourceBundleTranslator() {
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
      log.warn("Translations not available: " + e.getMessage());
    }
  }

  @Override
  public String translate(String text) {
    String l = null;
    String traduccion = text;
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
    if (traducciones != null && traducciones.containsKey(text))
      traduccion = traducciones.getString(text);
    return traduccion != null ? traduccion : text;
  }
}
