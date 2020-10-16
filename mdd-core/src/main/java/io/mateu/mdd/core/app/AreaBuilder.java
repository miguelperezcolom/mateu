package io.mateu.mdd.core.app;

import com.vaadin.icons.VaadinIcons;
import io.mateu.mdd.shared.annotations.Area;
import io.mateu.mdd.shared.annotations.Home;
import io.mateu.mdd.shared.annotations.PrivateHome;
import io.mateu.mdd.shared.annotations.PublicHome;
import io.mateu.mdd.shared.interfaces.IArea;
import io.mateu.mdd.shared.interfaces.IModule;
import io.mateu.mdd.shared.interfaces.MenuEntry;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.security.Private;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class AreaBuilder {
    private final Object ui;

    public AreaBuilder(Object ui) {
        this.ui = ui;
    }

    public List<AbstractArea> buildAreas(Class uiclass) {
        boolean allPrivate = uiclass.isAnnotationPresent(Private.class);

        List<AbstractArea> l = new ArrayList<>();
        addAreas(uiclass, l, true);
        addAreas(uiclass, l, false);
        if (l.size() == 0) {
            List<MenuEntry> privateMenu = new MenuBuilder().buildMenu(ui,false, false);
            List<MenuEntry> publicMenu = new MenuBuilder().buildMenu(ui,false, true);
            if (allPrivate) {
                privateMenu.addAll(publicMenu);
                if (privateMenu.size() > 0) l.add(new AreaFromMenu("", privateMenu, false, findDefaultAction(uiclass, false, false)));
            } else {
                if (privateMenu.size() > 0) l.add(new AreaFromMenu("", privateMenu, false, findDefaultAction(uiclass, false, false)));
                if (publicMenu.size() > 0 || isPublicHomeDefined(uiclass)) l.add(new AreaFromMenu("", publicMenu, true, findDefaultAction(uiclass, false, true)));
            }
            if (l.size() == 0) l.add(new FakeArea("", !allPrivate, findDefaultAction(uiclass, allPrivate, allPrivate)));
        }

        {
            if (isPublicHomeDefined(uiclass)) {
                AbstractArea areaPublicaPorDefecto = l.stream().filter(a -> a.isPublicAccess()).findFirst().orElse(null);
                if (areaPublicaPorDefecto == null) l.add(areaPublicaPorDefecto = new FakeArea("", true, findDefaultAction(uiclass, false, true)));
                else areaPublicaPorDefecto.defaultAction = findDefaultAction(uiclass, false, true);
            }
            if (isPrivateHomeDefined(uiclass)) {
                AbstractArea areaPrivadaPorDefecto = l.stream().filter(a -> !a.isPublicAccess()).findFirst().orElse(null);
                if (areaPrivadaPorDefecto == null) l.add(areaPrivadaPorDefecto = new FakeArea("", false, findDefaultAction(uiclass, false, false)));
                else areaPrivadaPorDefecto.defaultAction = findDefaultAction(uiclass, false, false);
            }
        }
        return l;
    }

    private boolean isPublicHomeDefined(Class uiclass) {
        return ReflectionHelper.getAllFields(ui.getClass()).stream().filter(f -> f.isAnnotationPresent(PublicHome.class)).map(f -> true).findFirst().orElse(
                ReflectionHelper.getAllMethods(ui.getClass()).stream().filter(f -> !uiclass.isAnnotationPresent(Private.class) && f.isAnnotationPresent(Home.class)).map(m -> true).findFirst().orElse(false)
        );
    }

    private boolean isPrivateHomeDefined(Class uiclass) {
        return ReflectionHelper.getAllFields(ui.getClass()).stream().filter(f -> f.isAnnotationPresent(PrivateHome.class)).map(f -> true).findFirst().orElse(
                ReflectionHelper.getAllMethods(ui.getClass()).stream().filter(f -> uiclass.isAnnotationPresent(Private.class) && f.isAnnotationPresent(Home.class)).map(m -> true).findFirst().orElse(false)
        );
    }

    private void addAreas(Class uiclass, List<AbstractArea> l, boolean publicAccess) {
        for (FieldInterfaced f : ReflectionHelper.getAllFields(uiclass)) {
            if (f.isAnnotationPresent(Area.class)) {
                if ((publicAccess && !f.isAnnotationPresent(Private.class)) || (!publicAccess && f.isAnnotationPresent(Private.class)))
                    addIfNotEmpty(l, createArea(f, false, publicAccess));
            }
        }
        for (Method m : ReflectionHelper.getAllMethods(uiclass)) {
            if (m.isAnnotationPresent(Area.class)) {
                if ((publicAccess && !m.isAnnotationPresent(Private.class)) || (!publicAccess && m.isAnnotationPresent(Private.class)))
                    addIfNotEmpty(l, createArea(m, false, publicAccess));
            }
        }
    }

    private void addIfNotEmpty(List<AbstractArea> l, AbstractArea a) {
        if (a.getModules().length > 0 && a.getModules()[0].getMenu().size() > 0) l.add(a);
    }

    private AbstractArea createArea(FieldInterfaced f, boolean authenticationAgnostic, boolean publicAccess) {
        return new AbstractArea(ReflectionHelper.getCaption(f)) {

            {
                defaultAction = findDefaultAction(f.getType(), authenticationAgnostic, publicAccess);
                icon = f.isAnnotationPresent(Area.class)?f.getAnnotation(Area.class).icon():VaadinIcons.ADOBE_FLASH;
                IArea area = this;
                modules = Arrays.asList(new AbstractModule() {

                    @Override
                    public String getName() {
                        return "Menu";
                    }

                    @Override
                    public List<MenuEntry> buildMenu() {
                        try {
                            Object v = ReflectionHelper.getValue(f, ui);
                            if (v == null) v = ReflectionHelper.newInstance(f.getType());
                            return new MenuBuilder().buildMenu(v, true, publicAccess);
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                        return new ArrayList<>();
                    }

                    @Override
                    public IArea getArea() {
                        return area;
                    }
                });
            }


            @Override
            public List<IModule> buildModules() {
                return modules;
            }

            @Override
            public boolean isPublicAccess() {
                return publicAccess;
            }
        };
    }

    private AbstractAction findDefaultAction(Class<?> type, boolean authenticationAgnostic, boolean publicAccess) {
        try {
            return findDefaultAction(type, ui, authenticationAgnostic, publicAccess);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    private AbstractAction findDefaultAction(Class<?> type, Object instance, boolean authenticationAgnostic, boolean publicAccess) {
        List<MenuEntry> l = new ArrayList<>();
        for (FieldInterfaced f : ReflectionHelper.getAllFields(type)) {
            if (!publicAccess && f.isAnnotationPresent(PrivateHome.class)) {
                MenuBuilder.addMenuEntry(l, instance, f, authenticationAgnostic, publicAccess);
            }
            if (publicAccess && f.isAnnotationPresent(PublicHome.class)) {
                MenuBuilder.addMenuEntry(l, instance, f, authenticationAgnostic, publicAccess);
            }
            if (l.size() == 0 && f.isAnnotationPresent(Home.class)) {
                MenuBuilder.addMenuEntry(l, instance, f, authenticationAgnostic, publicAccess);
            }
        }
        for (Method m : ReflectionHelper.getAllMethods(type)) {
            if (!publicAccess && m.isAnnotationPresent(PrivateHome.class)) {
                MenuBuilder.addMenuEntry(l, instance, m, authenticationAgnostic, publicAccess);
            }
            if (publicAccess && m.isAnnotationPresent(PublicHome.class)) {
                MenuBuilder.addMenuEntry(l, instance, m, authenticationAgnostic, publicAccess);
            }
            if (l.size() == 0 && m.isAnnotationPresent(Home.class)) {
                MenuBuilder.addMenuEntry(l, instance, m, authenticationAgnostic, publicAccess);
            }
        }
        return l.size() > 0? (AbstractAction) l.get(0) :null;
    }

    private AbstractArea createArea(Method method, boolean authenticationAgnostic, boolean publicAccess) {
        return new AbstractArea(ReflectionHelper.getCaption(method)) {
            @Override
            public List<IModule> buildModules() {
                IArea area = this;
                List<IModule> m = Arrays.asList(new AbstractModule() {
                    @Override
                    public String getName() {
                        return "Menu";
                    }

                    @Override
                    public List<MenuEntry> buildMenu() {
                        return new MenuBuilder().buildMenu(method.getReturnType(), true, publicAccess);
                    }

                    @Override
                    public IArea getArea() {
                        return area;
                    }
                });
                return m;
            }

            @Override
            public boolean isPublicAccess() {
                return publicAccess;
            }

            @Override
            public AbstractAction getDefaultAction() {
                return findDefaultAction(method.getReturnType(), authenticationAgnostic, publicAccess);
            }

            @Override
            public VaadinIcons getIcon() {
                return method.isAnnotationPresent(Area.class)?method.getAnnotation(Area.class).icon():VaadinIcons.ADOBE_FLASH;
            }
        };
    }

}
