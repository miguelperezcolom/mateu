package io.mateu.mdd.core.app.menuResolvers;

import io.mateu.mdd.core.app.AbstractMenu;
import io.mateu.mdd.core.app.MDDOpenRemoteJourneyAction;
import io.mateu.mdd.core.app.MDDOpenUrlAction;
import io.mateu.mdd.core.app.MDDOpenUserJourneyAction;
import io.mateu.mdd.shared.interfaces.JourneyRunner;
import io.mateu.mdd.shared.interfaces.MenuEntry;
import io.mateu.mdd.shared.interfaces.RemoteJourney;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.lang.reflect.InvocationTargetException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DefaultMenuResolver implements MenuResolver {

  final ReflectionHelper reflectionHelper;

  @Override
  public boolean addMenuEntry(
      Object app, List<MenuEntry> l, FieldInterfaced f, String caption, int order, String icon)
      throws InvocationTargetException, NoSuchMethodException, IllegalAccessException {
    if (RemoteJourney.class.isAssignableFrom(f.getType())) {

      MDDOpenRemoteJourneyAction a;
      l.add(
          a =
              new MDDOpenRemoteJourneyAction(
                  caption, (RemoteJourney) reflectionHelper.getValue(f, app)));
      a.setOrder(order);

    } else if (JourneyRunner.class.isAssignableFrom(f.getType())) {

      MDDOpenUserJourneyAction a;
      l.add(
          a =
              new MDDOpenUserJourneyAction(
                  caption, (JourneyRunner) reflectionHelper.getValue(f, app)));
      a.setOrder(order);

    } else if (List.class.isAssignableFrom(f.getType())
        && MenuEntry.class.equals(reflectionHelper.getGenericClass(f.getType()))) {
      l.add(
          new AbstractMenu(icon, caption) {
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
          }.setOrder(order));
    } else if (URL.class.equals(f.getType())) {
      l.add(new MDDOpenUrlAction(caption, (URL) reflectionHelper.getValue(f, app)));
    } else {
      return false;
    }
    return true;
  }
}
