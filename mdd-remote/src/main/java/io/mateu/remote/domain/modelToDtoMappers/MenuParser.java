package io.mateu.remote.domain.modelToDtoMappers;

import com.google.common.base.Strings;
import io.mateu.mdd.core.app.*;
import io.mateu.mdd.core.app.menuResolvers.MenuResolver;
import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.interfaces.*;
import io.mateu.mdd.shared.reflection.CoreReflectionHelper;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.application.MateuRemoteClient;
import io.mateu.remote.dtos.Menu;
import io.mateu.remote.dtos.UI;
import io.mateu.util.Helper;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.net.URL;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

public class MenuParser {

    private final MateuRemoteClient mateuRemoteClient;
    private final Object uiInstance;

    public MenuParser(MateuRemoteClient mateuRemoteClient, Object uiInstance) {
        this.mateuRemoteClient = mateuRemoteClient;
        this.uiInstance = uiInstance;
    }


    public List<MenuEntry> parse() {
        return buildMenu(true, true);
    }

    private List<MenuEntry> buildMenu(boolean authenticationAgnostic, boolean publicAccess) {
        List<MenuEntry> l = new ArrayList<>();

        for (FieldInterfaced f : ReflectionHelper.getAllFields(uiInstance.getClass())) {

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
                    add = authenticationAgnostic || check(pa);
                } else add = true;
            }

            if (add) {

                if (f.isAnnotationPresent(MenuOption.class) || f.isAnnotationPresent(Submenu.class)) {

                    addMenuEntry(l, f, authenticationAgnostic, publicAccess);

                }
            }

        }

        for (Method m : getAllMenuMethods(uiInstance.getClass())) {

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
                        add = check(pa);
                    } else add = true;
                }
            }

            if (add) {
                addMenuEntry(l, m, authenticationAgnostic, publicAccess);
            }

        }

        if (uiInstance instanceof IncludesRemoteUIs) {
            ((IncludesRemoteUIs) uiInstance).getRemoteUIs().forEach(remoteUI -> addMenuEntries(l, remoteUI));
        }

        l.sort(Comparator.comparingInt(MenuEntry::getOrder));

        return l;
    }


    private MenuEntry toMenuEntry(String caption, RemoteSubmenu remoteSubmenu) throws ExecutionException, InterruptedException {
        UI ui = mateuRemoteClient.getUi(remoteSubmenu.getBaseUrl(), remoteSubmenu.getUiId());
        Optional<Menu> remoteMenu = ui.getMenu().stream().filter(m -> m.getCaption().equals(remoteSubmenu.getCaption())).findFirst();
        MenuEntry menuEntry = new AbstractMenu(caption + (remoteMenu.isEmpty()?"(Not found)":"")) {
            @Override
            public List<MenuEntry> buildEntries() {
                if (remoteMenu.isEmpty()) {
                    return List.of();
                }
                List<MenuEntry> options = new ArrayList<>();
                remoteMenu.get().getSubmenus().forEach(m -> {
                    options.add(toMenuEntry(remoteSubmenu.getBaseUrl(), m));
                });
                return options;
            }
        };
        return menuEntry;
    }

    private void addMenuEntries(List<MenuEntry> l, RemoteUI remoteUI) {
        try {
            UI ui = mateuRemoteClient.getUi(remoteUI.getBaseUrl(), remoteUI.getUiId());
            ui.getMenu().stream().forEach(remoteMenu -> {
                MenuEntry menuEntry = toMenuEntry(remoteUI.getBaseUrl(), remoteMenu);
                l.add(menuEntry);
            });
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private MenuEntry toMenuEntry(String baseUrl, Menu remoteMenu) {
        MenuEntry menuEntry = null;
        if (!Strings.isNullOrEmpty(remoteMenu.getJourneyTypeId())) {
            menuEntry = new MDDOpenRemoteJourneyAction(remoteMenu.getCaption(), new RemoteJourney(baseUrl, remoteMenu.getJourneyTypeId()));
        } else {
            menuEntry = new AbstractMenu(remoteMenu.getCaption()) {
                @Override
                public List<MenuEntry> buildEntries() {
                    if (remoteMenu.getSubmenus() == null) {
                        return List.of();
                    }
                    List<MenuEntry> options = new ArrayList<>();
                    remoteMenu.getSubmenus().forEach(m -> {
                        options.add(toMenuEntry(baseUrl, m));
                    });
                    return options;
                }
            };
        }
        return menuEntry;
    }

    private boolean check(Private pa) {
        try {
            return Helper.getImpl(MateuSecurityManager.class).check(pa);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    private void addMenuEntry(List<MenuEntry> l, Method m, boolean authenticationAgnostic, boolean publicAccess) {
        String caption = (m.isAnnotationPresent(Submenu.class))?m.getAnnotation(Submenu.class).value():m.getAnnotation(MenuOption.class).value();
        if (Strings.isNullOrEmpty(caption)) caption = Helper.capitalize(m.getName());

        String icon = null;
        if (m.isAnnotationPresent(Submenu.class)) icon = m.getAnnotation(Submenu.class).icon();
        if (m.isAnnotationPresent(MenuOption.class)) icon = m.getAnnotation(MenuOption.class).icon();

        int order = 0;
        if (m.isAnnotationPresent(MenuOption.class)) order = m.getAnnotation(MenuOption.class).order();
        else if (m.isAnnotationPresent(Submenu.class)) order = m.getAnnotation(Submenu.class).order();
        if (order == 0 || order == 10000) order = l.size();


        if (m.isAnnotationPresent(Submenu.class)) {

            l.add(new AbstractMenu(icon, caption) {
                @Override
                public List<MenuEntry> buildEntries() {
                    try {
                        return new MenuParser(mateuRemoteClient, CoreReflectionHelper.invokeInjectableParametersOnly(m, uiInstance)).parse();
                    } catch (Throwable throwable) {
                        throwable.printStackTrace();
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

                            l = (List<MenuEntry>) CoreReflectionHelper.invokeInjectableParametersOnly(m, uiInstance);

                        } catch (Throwable e) {
                            e.printStackTrace();
                        }
                        return l;
                    }
                }.setOrder(order));


            } else {

                l.add(new MDDCallMethodAction(caption, null, m, uiInstance).setIcon(icon).setOrder(order));

            }


        }
    }

    private void addMenuEntry(List<MenuEntry> l, FieldInterfaced f, boolean authenticationAgnostic, boolean publicAccess) {
        String caption = ReflectionHelper.getCaption(f);

        String icon = null;
        if (f.isAnnotationPresent(Submenu.class)) icon = f.getAnnotation(Submenu.class).icon();
        if (f.isAnnotationPresent(MenuOption.class)) icon = f.getAnnotation(MenuOption.class).icon();

        int order = 0;
        if (f.isAnnotationPresent(MenuOption.class)) order = f.getAnnotation(MenuOption.class).order();
        else if (f.isAnnotationPresent(Submenu.class)) order = f.getAnnotation(Submenu.class).order();
        if (order == 0 || order == 10000) order = l.size();

        if (f.isAnnotationPresent(Submenu.class)) {

            if (!Modifier.isPublic(f.getModifiers())) {
                f.getField().setAccessible(true);
            }

            try {

                if (RemoteSubmenu.class.equals(f.getType())) {
                    RemoteSubmenu remoteSubmenu = (RemoteSubmenu) ReflectionHelper.getValue(f, uiInstance);
                    l.add(toMenuEntry(caption, remoteSubmenu));
                } else if (URL.class.equals(f.getType())) {
                    l.add(new MDDOpenUrlAction(caption, (URL) ReflectionHelper.getValue(f, uiInstance)));
                } else {
                    Object v = ReflectionHelper.getValue(f, uiInstance);
                    if (v == null) v = ReflectionHelper.newInstance(f.getType());
                    Object finalV = v;
                    l.add(new AbstractMenu(icon, caption) {
                        @Override
                        public List<MenuEntry> buildEntries() {
                            try {
                                return new MenuParser(mateuRemoteClient, finalV).parse();
                            } catch (Throwable throwable) {
                                throwable.printStackTrace();
                            }
                            return new ArrayList<>();
                        }
                    }.setOrder(order));

                }

            } catch (Exception e) {
                e.printStackTrace();
            }

        } else if (f.isAnnotationPresent(MenuOption.class) || f.isAnnotationPresent(Home.class) || f.isAnnotationPresent(PublicHome.class) || f.isAnnotationPresent(PrivateHome.class)) {

            try {

                if (!Modifier.isPublic(f.getModifiers())) {
                    f.getField().setAccessible(true);
                }

                List<MenuResolver> menuResolvers = Helper.getImpls(MenuResolver.class);

                boolean menuResolved = false;

                for (MenuResolver menuResolver : menuResolvers) {
                    menuResolved = menuResolver.addMenuEntry(uiInstance, l, f, caption, order, icon);
                    if (menuResolved) {
                        break;
                    }
                }

                if (!menuResolved) {
                    addDefaultMenuEntry(l, f, caption, order, icon);
                }

            } catch (Exception e) {
                e.printStackTrace();
            }

        }
    }


    private void addDefaultMenuEntry(List<MenuEntry> l, FieldInterfaced f, String caption, int order, String icon) throws InvocationTargetException, NoSuchMethodException, IllegalAccessException {
        Object v = ReflectionHelper.getValue(f, uiInstance);
        if (ReflectionHelper.isBasico(f.getType()) || String.class.equals(f.getType())) {
            if (f.isAnnotationPresent(Home.class) || f.isAnnotationPresent(PublicHome.class) || f.isAnnotationPresent(PrivateHome.class))
                l.add(new MDDOpenHtmlAction("Home", "" + v).setIcon("home").setOrder(order));
            else l.add(new MDDOpenHtmlAction(caption, "" + v).setIcon(icon).setOrder(order));
        } else if (Listing.class.isAssignableFrom(f.getType())) {
            l.add(new MDDOpenListViewAction(caption, f.getType()).setIcon(icon).setOrder(order));
        } else l.add(new MDDOpenEditorAction(caption, () -> {
            try {
                return v != null?v: ReflectionHelper.newInstance(f.getType());
            } catch (Exception e) {
                e.printStackTrace();
            }
            return null;
        }).setIcon(icon).setOrder(order));
    }

    private List<Method> getAllMenuMethods(Class c) {
        List<Method> l = new ArrayList<>();

        if (c.getSuperclass() != null)
            l.addAll(getAllMenuMethods(c.getSuperclass()));

        for (Method f : c.getDeclaredMethods()) if (f.isAnnotationPresent(MenuOption.class) || f.isAnnotationPresent(Submenu.class)) l.add(f);

        return l;
    }
}