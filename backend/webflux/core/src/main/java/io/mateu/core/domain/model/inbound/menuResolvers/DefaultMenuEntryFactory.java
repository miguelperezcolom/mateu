package io.mateu.core.domain.model.inbound.menuResolvers;

import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.uidl.app.*;
import io.mateu.uidl.interfaces.JourneyRunner;
import io.mateu.uidl.interfaces.Listing;
import io.mateu.uidl.interfaces.MenuEntry;
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

  public final ReflectionService reflectionService;

  public ReflectionService getReflectionService() {
    return reflectionService;
  }

  @Override
  public MenuEntry buildMenuEntry(Object app, AnnotatedElement f, String caption)
      throws InvocationTargetException, NoSuchMethodException, IllegalAccessException {
    if (JourneyRunner.class.isAssignableFrom(app.getClass())) {
      return new MDDOpenUserJourneyAction(caption, (JourneyRunner) app);
    } else if (List.class.isAssignableFrom(app.getClass())
        && MenuEntry.class.equals(
            reflectionService.getGenericClass(reflectionService.getType(f)))) {
      return new AbstractMenu(caption) {
        @Override
        public List<MenuEntry> buildEntries() {
          List<MenuEntry> l = new ArrayList<>();
          try {

            l = (List<MenuEntry>) reflectionService.getValue(f, app);

          } catch (Throwable e) {
            e.printStackTrace();
          }
          return l;
        }
      };
    } else if (URL.class.equals(app.getClass())) {
      return new MDDOpenUrlAction(caption, (URL) app);
    } else if (reflectionService.isBasic(app.getClass())) {
      return new MDDOpenHtmlAction(caption, "" + app);
    } else if (Listing.class.isAssignableFrom(app.getClass())) {
      Object finalUiInstance = app;
      return new MDDOpenListViewAction(caption, () -> (Listing) finalUiInstance);
    } else {
      Object finalUiInstance1 = app;
      return new MDDOpenEditorAction(caption, () -> finalUiInstance1);
    }
  }
}
