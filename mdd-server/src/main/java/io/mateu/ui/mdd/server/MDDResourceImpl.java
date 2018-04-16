package io.mateu.ui.mdd.server;

import com.google.common.io.CharStreams;
import io.mateu.ui.core.shared.Data;
import io.mateu.ui.core.shared.UserData;
import io.mateu.ui.mdd.server.annotations.Caption;
import io.mateu.ui.mdd.server.interfaces.App;
import io.mateu.ui.mdd.server.interfaces.Area;
import io.mateu.ui.mdd.server.interfaces.MDDAction;
import io.mateu.ui.mdd.server.interfaces.Module;

import java.io.IOException;
import java.io.InputStreamReader;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MDDResourceImpl implements MDDResource {

    static App app;

    static {
        if (app == null) {

            String cn = null;
            try {
                cn = CharStreams.toString(new InputStreamReader(MDDResourceImpl.class.getResourceAsStream("/META-INF/services/" + App.class.getName())));

                app = (App) Class.forName(cn).newInstance();
                System.out.println("app " + app.getClass().getName() + " loaded");

            } catch (IOException e) {
                e.printStackTrace();
            } catch (IllegalAccessException e) {
                e.printStackTrace();
            } catch (InstantiationException e) {
                e.printStackTrace();
            } catch (ClassNotFoundException e) {
                e.printStackTrace();
            }

        }


        if (app == null) System.out.println("App not found. Check META-INF/services/io.mateu.ui.App file");
    }



    @Override
    public Map<String, Object> getMenu() throws Throwable {
        Map<String, Object> data = new HashMap<>();

        try {
            if (app == null) throw new Throwable("App not found. Check META-INF/services/" + App.class.getName() + " file");

            for (Field f : app.getClass().getDeclaredFields()) {

                if (app.getClass().isAnnotationPresent(Caption.class)) data.put("appname", app.getClass().getAnnotation(Caption.class).value());
                else data.put("appname", app.getClass().getName());

                List<Map<String, Object>> areas = new ArrayList<>();
                data.put("areas", areas);

                if (Area.class.isAssignableFrom(f.getType())) {

                    Area a = (Area) f.get(app);

                    if (a == null) a = (Area) f.getType().newInstance();

                    Map<String, Object> area;
                    areas.add(area = new HashMap<>());

                    if (a.getClass().isAnnotationPresent(Caption.class)) area.put("name", a.getClass().getAnnotation(Caption.class).value());
                    else area.put("name", a.getClass().getName());

                    List<Map<String, Object>> modules = new ArrayList<>();
                    area.put("modules", modules);

                    for (Field fa : a.getClass().getDeclaredFields()) {

                        if (Module.class.isAssignableFrom(fa.getType())) {

                            Module m = (Module) fa.get(a);

                            if (m == null) m = (Module) fa.getType().newInstance();

                            Map<String, Object> module;
                            modules.add(module = new HashMap<>());

                            if (m.getClass().isAnnotationPresent(Caption.class)) module.put("name", m.getClass().getAnnotation(Caption.class).value());
                            else module.put("name", m.getClass().getName());

                            List<Map<String, Object>> actions = new ArrayList<>();
                            module.put("actions", actions);


                            for (Field fm : m.getClass().getFields()) {

                                if (MDDAction.class.isAssignableFrom(fm.getType())) {


                                    MDDAction act = (MDDAction) fm.get(m);

                                    if (act == null) try {
                                        act = (MDDAction) fm.getType().newInstance();
                                    } catch (Exception e) {

                                    }

                                    Map<String, Object> action;
                                    actions.add(action = new HashMap<>());

                                    if (fm.isAnnotationPresent(Caption.class)) action.put("name", fm.getAnnotation(Caption.class).value());
                                    else action.put("name", fm.getName());

                                    action.put("coordinates", f.getName() + "/" + fa.getName() + "/" + fm.getName());


                                }

                            }

                        }

                    }


                }


            }
        } catch (Throwable throwable) {
            throwable.printStackTrace();
            throw throwable;
        }

        return data;
    }

    @Override
    public UserData authenticate(Data parameters) {
        return null;
    }

    @Override
    public String getBooking(String bookingId) throws Throwable {
        return null;
    }
}
