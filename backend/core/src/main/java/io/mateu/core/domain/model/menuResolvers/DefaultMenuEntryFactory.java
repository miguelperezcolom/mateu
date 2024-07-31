package io.mateu.core.domain.model.menuResolvers;

import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.uidefinition.core.app.*;
import io.mateu.core.domain.uidefinition.shared.annotations.Home;
import io.mateu.core.domain.uidefinition.shared.annotations.PrivateHome;
import io.mateu.core.domain.uidefinition.shared.annotations.PublicHome;
import io.mateu.core.domain.uidefinition.shared.interfaces.JourneyRunner;
import io.mateu.core.domain.uidefinition.shared.interfaces.Listing;
import io.mateu.core.domain.uidefinition.shared.interfaces.MenuEntry;
import java.lang.reflect.AnnotatedElement;
import java.lang.reflect.InvocationTargetException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DefaultMenuEntryFactory implements MenuEntryFactory {

  public final ReflectionHelper reflectionHelper;

  public ReflectionHelper getReflectionHelper() {
    return reflectionHelper;
  }

  @Override
  public MenuEntry buildMenuEntry(Object app, AnnotatedElement f, String caption)
      throws InvocationTargetException, NoSuchMethodException, IllegalAccessException {
    if (JourneyRunner.class.isAssignableFrom(app.getClass())) {
      return new MDDOpenUserJourneyAction(caption, (JourneyRunner) app);
    } else if (List.class.isAssignableFrom(app.getClass())
        && MenuEntry.class.equals(reflectionHelper.getGenericClass(reflectionHelper.getType(f)))) {
      return new AbstractMenu(caption) {
        @Override
        public List<MenuEntry> buildEntries() {
          List<MenuEntry> l = new ArrayList<>();
          try {

            l = (List<MenuEntry>) reflectionHelper.getValue(f, app);

          } catch (Throwable e) {
            e.printStackTrace();
          }
          return l;
        }
      };
    } else if (URL.class.equals(app.getClass())) {
      return new MDDOpenUrlAction(caption, (URL) app);
    } else if (reflectionHelper.isBasico(app.getClass()) || String.class.equals(app.getClass())) {
      if (f.isAnnotationPresent(Home.class)
          || f.isAnnotationPresent(PublicHome.class)
          || f.isAnnotationPresent(PrivateHome.class))
        return new MDDOpenHtmlAction(caption, "" + app);
    } else if (Listing.class.isAssignableFrom(app.getClass())) {
      Object finalUiInstance = app;
      return new MDDOpenListViewAction(caption, () -> (Listing) finalUiInstance);
    } else {
      Object finalUiInstance1 = app;
      return new MDDOpenEditorAction(caption, () -> finalUiInstance1);
    }
    return null;
  }
}
