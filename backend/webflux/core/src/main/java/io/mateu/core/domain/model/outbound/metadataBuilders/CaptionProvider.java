package io.mateu.core.domain.model.outbound.metadataBuilders;

import com.google.common.base.Strings;
import io.mateu.core.domain.model.outbound.Humanizer;
import io.mateu.core.domain.model.outbound.i18n.Translator;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.model.reflection.fieldabstraction.FieldForCheckboxColumn;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Caption;
import io.mateu.uidl.annotations.Submenu;
import io.mateu.uidl.interfaces.HasTitle;
import java.lang.reflect.Method;
import org.springframework.stereotype.Service;

@Service
public class CaptionProvider {

  private final Humanizer humanizer;
  private final Translator translator;

  public CaptionProvider(Humanizer humanizer, Translator translator) {
    this.humanizer = humanizer;
    this.translator = translator;
  }

  public String getCaption(Object object) {
    var caption = guessCaption(object);
    return translator.translate(caption);
  }

  private String guessCaption(Object object) {
    if (object instanceof HasTitle hasTitle) {
      return hasTitle.getTitle();
    }
    if (object.getClass().isAnnotationPresent(Caption.class)) {
      return object.getClass().getAnnotation(Caption.class).value();
    }

    try {
      if (!object.getClass().getMethod("toString").getDeclaringClass().equals(Object.class)) {
        return object.toString();
      }
    } catch (NoSuchMethodException e) {
    }
    return humanizer.capitalize(object.getClass().getSimpleName());
  }

  public String getCaption(Field f) {
    if (f.isAnnotationPresent(Caption.class)) {
      return translator.translate(f.getAnnotation(Caption.class).value());
    } else {
      String caption = "";
      if (f.isAnnotationPresent(Submenu.class)) caption = f.getAnnotation(Submenu.class).value();
      if (f.isAnnotationPresent(Action.class)) caption = f.getAnnotation(Action.class).value();
      if (Strings.isNullOrEmpty(caption)) caption = humanizer.capitalize(f.getName());
      if (f instanceof FieldForCheckboxColumn fieldInterfacedForCheckboxColumn) {
        caption = fieldInterfacedForCheckboxColumn.getValueForColumn();
      }
      return translator.translate(caption);
    }
  }

  public String getCaption(Method f) {
    if (f.isAnnotationPresent(Caption.class)) {
      return translator.translate(f.getAnnotation(Caption.class).value());
    } else {
      String caption = "";
      if (f.isAnnotationPresent(Submenu.class)) caption = f.getAnnotation(Submenu.class).value();
      if (f.isAnnotationPresent(Action.class)) caption = f.getAnnotation(Action.class).value();
      if (Strings.isNullOrEmpty(caption)) caption = humanizer.capitalize(f.getName());
      return translator.translate(caption);
    }
  }
}
