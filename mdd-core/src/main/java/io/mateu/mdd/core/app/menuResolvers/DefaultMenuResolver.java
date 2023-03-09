package io.mateu.mdd.core.app.menuResolvers;

import com.google.auto.service.AutoService;
import com.google.common.base.Strings;
import com.vaadin.icons.VaadinIcons;
import io.mateu.mdd.core.app.*;
import io.mateu.mdd.shared.annotations.Columns;
import io.mateu.mdd.shared.annotations.EditableFields;
import io.mateu.mdd.shared.annotations.FilterFields;
import io.mateu.mdd.shared.annotations.Where;
import io.mateu.mdd.shared.interfaces.MenuEntry;
import io.mateu.mdd.shared.interfaces.RemoteForm;
import io.mateu.mdd.shared.interfaces.UserJourney;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.notification.Notifier;

import java.lang.reflect.InvocationTargetException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

@AutoService(MenuResolver.class)
public class DefaultMenuResolver implements MenuResolver {

    @Override
    public boolean addMenuEntry(Object app, List<MenuEntry> l, FieldInterfaced f, String caption, int order, VaadinIcons icon) throws InvocationTargetException, NoSuchMethodException, IllegalAccessException {
        if (RemoteForm.class.isAssignableFrom(f.getType())) {

            MDDOpenRemoteFormAction a;
            l.add(a = new MDDOpenRemoteFormAction(caption, (RemoteForm) ReflectionHelper.getValue(f, app)));
            a.setOrder(order);

        } else if (UserJourney.class.isAssignableFrom(f.getType())) {

            MDDOpenUserJourneyAction a;
            l.add(a = new MDDOpenUserJourneyAction(caption, (UserJourney) ReflectionHelper.getValue(f, app)));
            a.setOrder(order);

        } else if (List.class.isAssignableFrom(f.getType()) && MenuEntry.class.equals(ReflectionHelper.getGenericClass(f.getType()))) {
            l.add(new AbstractMenu(icon, caption) {
                @Override
                public List<MenuEntry> buildEntries() {
                    List<MenuEntry> l = new ArrayList<>();
                    try {

                        l = (List<MenuEntry>) ReflectionHelper.getValue(f, app);

                    } catch (Throwable e) {
                        Notifier.alert(e);
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
