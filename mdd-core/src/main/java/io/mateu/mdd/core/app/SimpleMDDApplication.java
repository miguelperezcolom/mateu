package io.mateu.mdd.core.app;

import com.google.common.base.Strings;
import com.vaadin.icons.VaadinIcons;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.*;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class SimpleMDDApplication extends BaseMDDApp {

    @Override
    public String getName() {
        if (getClass().isAnnotationPresent(Caption.class)) return getClass().getAnnotation(Caption.class).value();
        return Helper.capitalize(getClass().getSimpleName());
    }

    public AbstractAction getDefaultAction() {
        return null;
    }

    @Override
    public List<AbstractArea> buildAreas() {
        List<AbstractArea> l = new ArrayList<>();
        addPrivateAreas(l);
        if (!isAuthenticationAgnostic()) addPublicAreas(l);
        return l;
    }

    private void addPublicAreas(List<AbstractArea> l) {
        AbstractArea a = new AbstractArea("") {
            @Override
            public List<AbstractModule> buildModules() {
                List<AbstractModule> m = Arrays.asList(new AbstractModule() {
                    @Override
                    public String getName() {
                        return "Menu";
                    }

                    @Override
                    public List<MenuEntry> buildMenu() {
                        return SimpleMDDApplication.this.buildMenu(true);
                    }
                });
                return m;
            }

            @Override
            public boolean isPublicAccess() {
                return true;
            }

            @Override
            public AbstractAction getDefaultAction() {
                return SimpleMDDApplication.this.getDefaultAction();
            }
        };
        if (a.getModules().size() > 0 && a.getModules().get(0).getMenu().size() > 0) l.add(a);
    }

    public void addPrivateAreas(List<AbstractArea> l) {
        AbstractArea a = new AbstractArea("") {
            @Override
            public List<AbstractModule> buildModules() {
                List<AbstractModule> m = Arrays.asList(new AbstractModule() {
                    @Override
                    public String getName() {
                        return "Menu";
                    }

                    @Override
                    public List<MenuEntry> buildMenu() {
                        return SimpleMDDApplication.this.buildMenu(false);
                    }
                });
                return m;
            }

            @Override
            public boolean isPublicAccess() {
                return false;
            }

            @Override
            public AbstractAction getDefaultAction() {
                return SimpleMDDApplication.this.getDefaultAction();
            }
        };
        if (a.getModules().size() > 0 && a.getModules().get(0).getMenu().size() > 0) l.add(a);
    }

    List<MenuEntry> buildMenu(boolean publicAccess) {
        return buildMenu(this, publicAccess);
    }

    List<MenuEntry> buildMenu(Object app, boolean publicAccess) {
        List<MenuEntry> l = new ArrayList<>();

        for (Method m : getAllActionMethods(app.getClass())) {

            boolean add = false;

            if (isAuthenticationAgnostic()) {
                add = true;
            } else {
                if (publicAccess && !m.isAnnotationPresent(Private.class) && (!SimpleMDDApplication.this.isAuthenticationNeeded() || m.isAnnotationPresent(Public.class))) {
                    add = true;
                }
                if (!publicAccess && !m.isAnnotationPresent(Public.class) && (SimpleMDDApplication.this.isAuthenticationNeeded() || m.isAnnotationPresent(Private.class))) {
                    Private pa = m.getAnnotation(Private.class);
                    if (pa != null) {
                        add = MDD.check(pa);
                    } else add = true;
                }
            }

            if (add) {
                String caption = (m.isAnnotationPresent(SubApp.class))?m.getAnnotation(SubApp.class).value():m.getAnnotation(Action.class).value();
                if (Strings.isNullOrEmpty(caption)) caption = Helper.capitalize(m.getName());

                VaadinIcons icon = (m.isAnnotationPresent(SubApp.class))?m.getAnnotation(SubApp.class).icon():m.getAnnotation(Action.class).icon();
                if (VaadinIcons.ADOBE_FLASH.equals(icon)) icon = null;

                if (m.isAnnotationPresent(SubApp.class)) {

                    l.add(new AbstractMenu(icon, caption) {
                        @Override
                        public List<MenuEntry> buildEntries() {
                            try {
                                return buildMenu(ReflectionHelper.invokeInjectableParametersOnly(m, app), publicAccess);
                            } catch (Throwable throwable) {
                                MDD.alert(throwable);
                            }
                            return new ArrayList<>();
                        }
                    });

                } else {

                    if (List.class.isAssignableFrom(m.getReturnType()) && MenuEntry.class.equals(ReflectionHelper.getGenericClass(m))) {

                        l.add(new AbstractMenu(icon, caption) {
                            @Override
                            public List<MenuEntry> buildEntries() {
                                List<MenuEntry> l = new ArrayList<>();
                                try {

                                    l = (List<MenuEntry>) ReflectionHelper.invokeInjectableParametersOnly(m, SimpleMDDApplication.this);

                                } catch (Throwable e) {
                                    MDD.alert(e);
                                }
                                return l;
                            }
                        });


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
                        }.setIcon(icon));

                    }


                }
            }

        }

        return l;
    }

    List<Method> getAllActionMethods(Class c) {
        List<Method> l = new ArrayList<>();

        if (c.getSuperclass() != null && !SimpleMDDApplication.class.equals(c.getSuperclass()))
            l.addAll(getAllActionMethods(c.getSuperclass()));

        for (Method f : c.getDeclaredMethods()) if (f.isAnnotationPresent(Action.class) || f.isAnnotationPresent(SubApp.class)) l.add(f);

        l.sort((a, b) -> {
            int orderA = 0;
            if (a.isAnnotationPresent(Action.class)) orderA = a.getAnnotation(Action.class).order();
            else if (a.isAnnotationPresent(SubApp.class)) orderA = a.getAnnotation(SubApp.class).order();
            int orderB = 0;
            if (b.isAnnotationPresent(Action.class)) orderB = b.getAnnotation(Action.class).order();
            else if (b.isAnnotationPresent(SubApp.class)) orderB = b.getAnnotation(SubApp.class).order();
            return orderA - orderB;
        });

        return l;
    }

    @Override
    public boolean isAuthenticationNeeded() {
        return false;
    }
}
