package io.mateu.mdd.core.app;

import com.google.common.base.Strings;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.Component;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.menuResolvers.MenuResolver;
import io.mateu.mdd.core.interfaces.WizardPage;
import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.interfaces.*;
import io.mateu.mdd.shared.reflection.CoreReflectionHelper;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.security.Private;
import io.mateu.util.Helper;
import io.mateu.util.notification.Notifier;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.net.URL;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class MenuBuilder {

    public MenuBuilder() {
    }

    public static List<MenuEntry> buildMenu(Object app, boolean authenticationAgnostic, boolean publicAccess) {
        List<MenuEntry> l = new ArrayList<>();

        for (FieldInterfaced f : ReflectionHelper.getAllFields(app.getClass())) {

            if (!Modifier.isPublic(f.getModifiers())) {
                f.getField().setAccessible(true);
            }

            boolean add = false;

            if (publicAccess && !f.isAnnotationPresent(Private.class)) {
                add = true;
            }
            if (!publicAccess && f.isAnnotationPresent(Private.class)) {
                Private pa = f.getAnnotation(Private.class);
                if (pa != null) {
                    add = authenticationAgnostic || MDD.check(pa);
                } else add = true;
            }

            if (add) {

                if (f.isAnnotationPresent(MenuOption.class) || f.isAnnotationPresent(Submenu.class)) {

                    addMenuEntry(l, app, f, authenticationAgnostic, publicAccess);

                }
            }

        }

        for (Method m : getAllMenuMethods(app.getClass())) {

            if (!Modifier.isPublic(m.getModifiers())) {
                m.setAccessible(true);
            }

            boolean add = false;

            if (authenticationAgnostic) {
                add = true;
            } else {
                if (publicAccess && !m.isAnnotationPresent(Private.class)) {
                    add = true;
                }
                if (!publicAccess && m.isAnnotationPresent(Private.class)) {
                    Private pa = m.getAnnotation(Private.class);
                    if (pa != null) {
                        add = MDD.check(pa);
                    } else add = true;
                }
            }

            if (add) {
                addMenuEntry(l, app, m, authenticationAgnostic, publicAccess);
            }

        }

        l.sort(Comparator.comparingInt(MenuEntry::getOrder));

        return l;
    }

    public static void addMenuEntry(List<MenuEntry> l, Object app, Method m, boolean authenticationAgnostic, boolean publicAccess) {
        String caption = (m.isAnnotationPresent(Submenu.class))?m.getAnnotation(Submenu.class).value():m.getAnnotation(MenuOption.class).value();
        if (Strings.isNullOrEmpty(caption)) caption = Helper.capitalize(m.getName());

        VaadinIcons icon = VaadinIcons.ADOBE_FLASH;
        if (m.isAnnotationPresent(Submenu.class)) icon = m.getAnnotation(Submenu.class).icon();
        if (m.isAnnotationPresent(MenuOption.class)) icon = m.getAnnotation(MenuOption.class).icon();
        if (VaadinIcons.ADOBE_FLASH.equals(icon)) icon = null;

        int order = 0;
        if (m.isAnnotationPresent(MenuOption.class)) order = m.getAnnotation(MenuOption.class).order();
        else if (m.isAnnotationPresent(Submenu.class)) order = m.getAnnotation(Submenu.class).order();
        if (order == 0 || order == 10000) order = l.size();


        if (m.isAnnotationPresent(Submenu.class)) {

            l.add(new AbstractMenu(icon, caption) {
                @Override
                public List<MenuEntry> buildEntries() {
                    try {
                        return buildMenu(CoreReflectionHelper.invokeInjectableParametersOnly(m, app), authenticationAgnostic, publicAccess);
                    } catch (Throwable throwable) {
                        Notifier.alert(throwable);
                    }
                    return new ArrayList<>();
                }
            }.setOrder(order));

        } else if (m.isAnnotationPresent(MenuOption.class) || m.isAnnotationPresent(Home.class) || m.isAnnotationPresent(PublicHome.class) || m.isAnnotationPresent(PrivateHome.class)) {

            if (List.class.isAssignableFrom(m.getReturnType()) && MenuEntry.class.equals(ReflectionHelper.getGenericClass(m))) {

                l.add(new AbstractMenu(icon, caption) {
                    @Override
                    public List<MenuEntry> buildEntries() {
                        List<MenuEntry> l = new ArrayList<>();
                        try {

                            l = (List<MenuEntry>) CoreReflectionHelper.invokeInjectableParametersOnly(m, app);

                        } catch (Throwable e) {
                            Notifier.alert(e);
                        }
                        return l;
                    }
                }.setOrder(order));


            } else {

                l.add(new MDDCallMethodAction(caption, null, m, app, null).setIcon(icon).setOrder(order));

            }


        }
    }

    public static void addMenuEntry(List<MenuEntry> l, Object app, FieldInterfaced f, boolean authenticationAgnostic, boolean publicAccess) {
        String caption = ReflectionHelper.getCaption(f);

        VaadinIcons icon = VaadinIcons.ADOBE_FLASH;
        if (f.isAnnotationPresent(Submenu.class)) icon = f.getAnnotation(Submenu.class).icon();
        if (f.isAnnotationPresent(MenuOption.class)) icon = f.getAnnotation(MenuOption.class).icon();
        if (VaadinIcons.ADOBE_FLASH.equals(icon)) icon = null;

        int order = 0;
        if (f.isAnnotationPresent(MenuOption.class)) order = f.getAnnotation(MenuOption.class).order();
        else if (f.isAnnotationPresent(Submenu.class)) order = f.getAnnotation(Submenu.class).order();
        if (order == 0 || order == 10000) order = l.size();

        if (f.isAnnotationPresent(Submenu.class)) {

            if (!Modifier.isPublic(f.getModifiers())) {
                f.getField().setAccessible(true);
            }

            try {

                if (URL.class.equals(f.getType())) {
                    l.add(new MDDOpenUrlAction(caption, (URL) ReflectionHelper.getValue(f, app)));
                } else {
                    Object v = ReflectionHelper.getValue(f, app);
                    if (v == null) v = ReflectionHelper.newInstance(f.getType());
                    Object finalV = v;
                    l.add(new AbstractMenu(icon, caption) {
                        @Override
                        public List<MenuEntry> buildEntries() {
                            try {
                                return buildMenu(finalV, true, publicAccess);
                            } catch (Throwable throwable) {
                                Notifier.alert(throwable);
                            }
                            return new ArrayList<>();
                        }
                    }.setOrder(order));

                }

            } catch (Exception e) {
                Notifier.alert(e);
            }

        } else if (f.isAnnotationPresent(MenuOption.class) || f.isAnnotationPresent(Home.class) || f.isAnnotationPresent(PublicHome.class) || f.isAnnotationPresent(PrivateHome.class)) {

            try {

                if (!Modifier.isPublic(f.getModifiers())) {
                    f.getField().setAccessible(true);
                }

                List<MenuResolver> menuResolvers = Helper.getImpls(MenuResolver.class);
                
                boolean menuResolved = false;

                for (MenuResolver menuResolver : menuResolvers) {
                    menuResolved = menuResolver.addMenuEntry(app, l, f, caption, order, icon);
                }

                if (!menuResolved) {
                    addDefaultMenuEntry(app, l, f, caption, order, icon);
                }

            } catch (Exception e) {
                Notifier.alert(e);
            }
        }
    }

    private static void addDefaultMenuEntry(Object app, List<MenuEntry> l, FieldInterfaced f, String caption, int order, VaadinIcons icon) throws InvocationTargetException, NoSuchMethodException, IllegalAccessException {
        Object v = ReflectionHelper.getValue(f, app);
        if (ReflectionHelper.isBasico(f.getType()) || String.class.equals(f.getType())) {
            if (f.isAnnotationPresent(Home.class) || f.isAnnotationPresent(PublicHome.class) || f.isAnnotationPresent(PrivateHome.class))
                l.add(new MDDOpenHtmlAction("Home", "" + v).setIcon(VaadinIcons.HOME).setOrder(order));
            else l.add(new MDDOpenHtmlAction(caption, "" + v).setIcon(icon).setOrder(order));
        } else if (WizardPage.class.isAssignableFrom(f.getType())) {
            l.add(new MDDOpenWizardAction(caption, () -> {
                try {
                    return v != null?(WizardPage) v: (WizardPage) ReflectionHelper.newInstance(f.getType());
                } catch (Exception e) {
                    Notifier.alert(e);
                }
                return null;
            }).setIcon(icon).setOrder(order));
        } else if (RpcView.class.isAssignableFrom(f.getType())) {
            l.add(new MDDOpenListViewAction(caption, f.getType()).setIcon(icon).setOrder(order));
        } else if (Component.class.isAssignableFrom(f.getType())) {
            if (v != null) l.add(new MDDOpenCustomComponentAction(caption, v));
            else l.add(new MDDOpenCustomComponentAction(caption, f.getType()));
        } else l.add(new MDDOpenEditorAction(caption, () -> {
            try {
                return v != null?v: ReflectionHelper.newInstance(f.getType());
            } catch (Exception e) {
                Notifier.alert(e);
            }
            return null;
        }).setIcon(icon).setOrder(order));
    }

    static List<Method> getAllMenuMethods(Class c) {
        List<Method> l = new ArrayList<>();

        if (c.getSuperclass() != null && !MateuApp.class.equals(c.getSuperclass()))
            l.addAll(getAllMenuMethods(c.getSuperclass()));

        for (Method f : c.getDeclaredMethods()) if (f.isAnnotationPresent(MenuOption.class) || f.isAnnotationPresent(Submenu.class)) l.add(f);

        return l;
    }
}
