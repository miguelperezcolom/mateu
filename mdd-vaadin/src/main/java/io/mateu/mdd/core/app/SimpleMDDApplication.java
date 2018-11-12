package io.mateu.mdd.core.app;

import com.google.common.base.Strings;
import io.mateu.mdd.core.annotations.Caption;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.annotations.Caption;
import io.mateu.mdd.core.annotations.SubApp;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class SimpleMDDApplication extends BaseMDDApp {

    @Override
    public String getName() {
        if (getClass().isAnnotationPresent(Caption.class)) return getClass().getAnnotation(Caption.class).value();
        return Helper.capitalize(getClass().getName());
    }

    public AbstractAction getDefaultAction() {
        return null;
    }

    @Override
    public List<AbstractArea> buildAreas() {
        List<AbstractArea> l = Arrays.asList(new AbstractArea("") {
            @Override
            public List<AbstractModule> buildModules() {
                List<AbstractModule> m = Arrays.asList(new AbstractModule() {
                    @Override
                    public String getName() {
                        return "Menu";
                    }

                    @Override
                    public List<MenuEntry> buildMenu() {
                        return SimpleMDDApplication.this.buildMenu();
                    }
                });
                return m;
            }

            @Override
            public boolean isPublicAccess() {
                return !SimpleMDDApplication.this.isAuthenticationNeeded();
            }

            @Override
            public AbstractAction getDefaultAction() {
                return SimpleMDDApplication.this.getDefaultAction();
            }
        });
        return l;
    }

    List<MenuEntry> buildMenu() {
        return buildMenu(this);
    }

    List<MenuEntry> buildMenu(Object app) {
        List<MenuEntry> l = new ArrayList<>();

        for (Method m : getAllActionMethods(app.getClass())) {

            String caption = (m.isAnnotationPresent(SubApp.class))?m.getAnnotation(SubApp.class).value():m.getAnnotation(Action.class).value();
            if (Strings.isNullOrEmpty(caption)) caption = Helper.capitalize(m.getName());

            if (m.isAnnotationPresent(SubApp.class)) {

                l.add(new AbstractMenu(caption) {
                    @Override
                    public List<MenuEntry> buildEntries() {
                        try {
                            return buildMenu(ReflectionHelper.invokeInjectableParametersOnly(m, app));
                        } catch (Throwable throwable) {
                            MDD.alert(throwable);
                        }
                        return new ArrayList<>();
                    }
                });

            } else {

                if (List.class.isAssignableFrom(m.getReturnType()) && MenuEntry.class.equals(ReflectionHelper.getGenericClass(m))) {

                    l.add(new AbstractMenu(caption) {
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
                        public void run(MDDExecutionContext context) {
                            try {

                                context.callMethod(null, m, app);

                            } catch (Throwable e) {
                                MDD.alert(e);
                            }
                        }
                    });

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
