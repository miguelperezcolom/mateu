package io.mateu.mdd.core.app.menuResolvers;

import com.google.auto.service.AutoService;
import io.mateu.mdd.core.app.AbstractMenu;
import io.mateu.mdd.core.app.MDDOpenRemoteFormAction;
import io.mateu.mdd.core.app.MDDOpenUrlAction;
import io.mateu.mdd.core.app.MDDOpenUserJourneyAction;
import io.mateu.mdd.shared.interfaces.JourneyRunner;
import io.mateu.mdd.shared.interfaces.MenuEntry;
import io.mateu.mdd.shared.interfaces.RemoteForm;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;

import java.lang.reflect.InvocationTargetException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

@AutoService(MenuResolver.class)
public class DefaultMenuResolver implements MenuResolver {

    @Override
    public boolean addMenuEntry(Object app, List<MenuEntry> l, FieldInterfaced f, String caption, int order, String icon) throws InvocationTargetException, NoSuchMethodException, IllegalAccessException {
        if (RemoteForm.class.isAssignableFrom(f.getType())) {

            MDDOpenRemoteFormAction a;
            l.add(a = new MDDOpenRemoteFormAction(caption, (RemoteForm) ReflectionHelper.getValue(f, app)));
            a.setOrder(order);

        } else if (JourneyRunner.class.isAssignableFrom(f.getType())) {

            MDDOpenUserJourneyAction a;
            l.add(a = new MDDOpenUserJourneyAction(caption, (JourneyRunner) ReflectionHelper.getValue(f, app)));
            a.setOrder(order);

        } else if (List.class.isAssignableFrom(f.getType()) && MenuEntry.class.equals(ReflectionHelper.getGenericClass(f.getType()))) {
            l.add(new AbstractMenu(icon, caption) {
                @Override
                public List<MenuEntry> buildEntries() {
                    List<MenuEntry> l = new ArrayList<>();
                    try {

                        l = (List<MenuEntry>) ReflectionHelper.getValue(f, app);

                    } catch (Throwable e) {
                       e.printStackTrace();
                    }
                    return l;
                }
            }.setOrder(order));
        } else if (URL.class.equals(f.getType())) {
            l.add(new MDDOpenUrlAction(caption, (URL) ReflectionHelper.getValue(f, app)));
        } else {
            return false;
        }
        return true;
    }

}
