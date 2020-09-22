package io.mateu.mdd.core.app;

import com.google.common.base.Strings;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.shared.ui.ContentMode;
import com.vaadin.ui.Label;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.*;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.vaadinport.vaadin.navigation.ComponentWrapper;

import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class MenuBuilder {

    public MenuBuilder() {
    }

    public static List<MenuEntry> buildMenu(Object app, boolean authenticationAgnostic, boolean publicAccess) {
        List<MenuEntry> l = new ArrayList<>();

        for (FieldInterfaced f : ReflectionHelper.getAllFields(app.getClass())) if (Modifier.isPublic(f.getModifiers())) {

            boolean add = false;

            if (authenticationAgnostic) {
                add = true;
            } else {
                if (publicAccess && !f.isAnnotationPresent(Private.class)) {
                    add = true;
                }
                if (!publicAccess && f.isAnnotationPresent(Private.class)) {
                    Private pa = f.getAnnotation(Private.class);
                    if (pa != null) {
                        //todo: el check debemos hacerlo en tiempo de ejecución
                        add = true; //MDD.check(pa);
                    } else add = true;
                }
            }

            if (add) {

                if (f.isAnnotationPresent(Action.class) || f.isAnnotationPresent(Submenu.class)) {

                    addAction(l, app, f, authenticationAgnostic, publicAccess);

                }
            }

        }

        for (Method m : getAllActionMethods(app.getClass())) if (Modifier.isPublic(m.getModifiers())) {

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
                        //todo: el check debemos hacerlo en tiempo de ejecución
                        add = true; //MDD.check(pa);
                    } else add = true;
                }
            }

            if (add) {
                addAction(l, app, m, authenticationAgnostic, publicAccess);
            }

        }

        l.sort(Comparator.comparingInt(MenuEntry::getOrder));

        return l;
    }

    public static void addAction(List<MenuEntry> l, Object app, Method m, boolean authenticationAgnostic, boolean publicAccess) {
        String caption = (m.isAnnotationPresent(Submenu.class))?m.getAnnotation(Submenu.class).value():m.getAnnotation(Action.class).value();
        if (Strings.isNullOrEmpty(caption)) caption = Helper.capitalize(m.getName());

        VaadinIcons icon = VaadinIcons.ADOBE_FLASH;
        if (m.isAnnotationPresent(Submenu.class)) icon = m.getAnnotation(Submenu.class).icon();
        if (m.isAnnotationPresent(Action.class)) icon = m.getAnnotation(Action.class).icon();
        if (VaadinIcons.ADOBE_FLASH.equals(icon)) icon = null;

        int order = 0;
        if (m.isAnnotationPresent(Action.class)) order = m.getAnnotation(Action.class).order();
        else if (m.isAnnotationPresent(Submenu.class)) order = m.getAnnotation(Submenu.class).order();
        if (order == 0 || order == 10000) order = l.size();


        if (m.isAnnotationPresent(Submenu.class)) {

            l.add(new AbstractMenu(icon, caption) {
                @Override
                public List<MenuEntry> buildEntries() {
                    try {
                        return buildMenu(ReflectionHelper.invokeInjectableParametersOnly(m, app), authenticationAgnostic, publicAccess);
                    } catch (Throwable throwable) {
                        MDD.alert(throwable);
                    }
                    return new ArrayList<>();
                }
            }.setOrder(order));

        } else if (m.isAnnotationPresent(Action.class) || m.isAnnotationPresent(Home.class) || m.isAnnotationPresent(PublicHome.class) || m.isAnnotationPresent(PrivateHome.class)) {

            if (List.class.isAssignableFrom(m.getReturnType()) && MenuEntry.class.equals(ReflectionHelper.getGenericClass(m))) {

                l.add(new AbstractMenu(icon, caption) {
                    @Override
                    public List<MenuEntry> buildEntries() {
                        List<MenuEntry> l = new ArrayList<>();
                        try {

                            l = (List<MenuEntry>) ReflectionHelper.invokeInjectableParametersOnly(m, app);

                        } catch (Throwable e) {
                            MDD.alert(e);
                        }
                        return l;
                    }
                }.setOrder(order));


            } else {

                l.add(new AbstractAction(caption) {
                    @Override
                    public void run() {
                        try {

                            MDDUI.get().getNavegador().getViewProvider().callMethod(null, m, app, null, true);

                        } catch (Throwable e) {
                            MDD.alert(e);
                        }
                    }
                }.setIcon(icon).setOrder(order));

            }


        }
    }

    public static void addAction(List<MenuEntry> l, Object app, FieldInterfaced f, boolean authenticationAgnostic, boolean publicAccess) {
        String caption = ReflectionHelper.getCaption(f);

        VaadinIcons icon = VaadinIcons.ADOBE_FLASH;
        if (f.isAnnotationPresent(Submenu.class)) icon = f.getAnnotation(Submenu.class).icon();
        if (f.isAnnotationPresent(Action.class)) icon = f.getAnnotation(Action.class).icon();
        if (VaadinIcons.ADOBE_FLASH.equals(icon)) icon = null;

        int order = 0;
        if (f.isAnnotationPresent(Action.class)) order = f.getAnnotation(Action.class).order();
        else if (f.isAnnotationPresent(Submenu.class)) order = f.getAnnotation(Submenu.class).order();
        if (order == 0 || order == 10000) order = l.size();

        if (f.isAnnotationPresent(Submenu.class)) {

            try {

                {
                    Object v = ReflectionHelper.getValue(f, app);
                    if (v == null) v = ReflectionHelper.newInstance(f.getType());
                    Object finalV = v;
                    l.add(new AbstractMenu(icon, caption) {
                        @Override
                        public List<MenuEntry> buildEntries() {
                            try {
                                return buildMenu(finalV, true, publicAccess);
                            } catch (Throwable throwable) {
                                MDD.alert(throwable);
                            }
                            return new ArrayList<>();
                        }
                    }.setOrder(order));

                }

            } catch (Exception e) {
                MDD.alert(e);
            }
        } else if (f.isAnnotationPresent(Action.class) || f.isAnnotationPresent(Home.class) || f.isAnnotationPresent(PublicHome.class) || f.isAnnotationPresent(PrivateHome.class)) {

            try {

                if (Class.class.isAssignableFrom(f.getType())) {
                    Class type = (Class) ReflectionHelper.getValue(f, app);
                    if (type != null) l.add(new MDDOpenCRUDAction(caption, type).setIcon(icon).setOrder(order));
                } else if (List.class.isAssignableFrom(f.getType()) && MenuEntry.class.equals(ReflectionHelper.getGenericClass(f.getType()))) {
                    l.add(new AbstractMenu(icon, caption) {
                        @Override
                        public List<MenuEntry> buildEntries() {
                            List<MenuEntry> l = new ArrayList<>();
                            try {

                                l = (List<MenuEntry>) ReflectionHelper.getValue(f, app);

                            } catch (Throwable e) {
                                MDD.alert(e);
                            }
                            return l;
                        }
                    }.setOrder(order));
                } else {
                    Object v = ReflectionHelper.getValue(f, app);
                    if (v == null) v = ReflectionHelper.newInstance(f.getType());
                    if (ReflectionHelper.isBasico(v)) {
                        if (f.isAnnotationPresent(Home.class) || f.isAnnotationPresent(PublicHome.class) || f.isAnnotationPresent(PrivateHome.class)) l.add(new MDDOpenCustomComponentAction("Home", new ComponentWrapper(VaadinIcons.HOME, "Home", new Label("" + v, ContentMode.HTML), false)).setIcon(VaadinIcons.HOME).setOrder(order));
                        else l.add(new MDDOpenCustomComponentAction(caption, new ComponentWrapper(caption, new Label("" + v, ContentMode.HTML))).setIcon(icon).setOrder(order));
                    } else l.add(new MDDOpenEditorAction(caption, v).setIcon(icon).setOrder(order));
                }

            } catch (Exception e) {
                MDD.alert(e);
            }
        }

    }


    static List<Method> getAllActionMethods(Class c) {
        List<Method> l = new ArrayList<>();

        if (c.getSuperclass() != null && !MateuUI.class.equals(c.getSuperclass()))
            l.addAll(getAllActionMethods(c.getSuperclass()));

        for (Method f : c.getDeclaredMethods()) if (f.isAnnotationPresent(Action.class) || f.isAnnotationPresent(Submenu.class)) l.add(f);

        return l;
    }
}
