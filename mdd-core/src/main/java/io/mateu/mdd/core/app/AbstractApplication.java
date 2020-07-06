package io.mateu.mdd.core.app;


import com.google.common.base.Strings;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.data.Data;
import io.mateu.mdd.core.data.UserData;
import io.mateu.mdd.core.interfaces.App;
import io.mateu.mdd.core.interfaces.View;
import io.mateu.mdd.core.model.authentication.User;
import io.mateu.mdd.core.model.config.AppConfig;
import io.mateu.mdd.core.model.population.Populator;
import io.mateu.mdd.core.model.ui.EditedRecord;
import io.mateu.mdd.core.nose.MemorizadorRegistroEditado;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.util.JPATransaction;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders.AbstractFieldBuilder;
import lombok.extern.slf4j.Slf4j;

import javax.persistence.EntityManager;
import java.util.*;

/**
 * Created by miguel on 8/8/16.
 */
@Slf4j
public abstract class AbstractApplication implements App {

    private String port;
    private Map<AbstractArea, String> areaIds;
    private Map<String, AbstractArea> areaIdsReversed;
    private Map<MenuEntry, AbstractArea> menuToArea;
    private Map<MenuEntry, String> menuIds;
    private Map<String, MenuEntry> menuIdsReversed;
    private Map<AbstractModule, String> moduleIds;
    private Map<String, AbstractModule> moduleIdsReversed;
    private Map<AbstractModule, AbstractArea> moduleToArea;
    private Map<MenuEntry, List<MenuEntry>> menuPaths;
    List<AbstractArea> areas = null;

    private MemorizadorRegistroEditado memorizador;

    public static AbstractApplication get() {
        return get(MDD.getUserData());
    }

    public static AbstractApplication get(UserData userData) {
        if (!Strings.isNullOrEmpty(System.getProperty("appClassName"))) {
            try {
                Object app = Class.forName(System.getProperty("appClassName")).newInstance();
                if (app instanceof AppProvider) app = ((AppProvider) app).getApp(userData != null?Helper.find(User.class, userData.getLogin()):null);
                return (AbstractApplication) app;
            } catch (Throwable throwable) {
                throwable.printStackTrace();
            }
        }

        Iterator<App> apps = ServiceLoader.load(App.class).iterator();
        AbstractApplication app = null;
        while (apps.hasNext()) {
            app = (AbstractApplication) apps.next();
            if (app instanceof AppProvider) app = ((AppProvider) app).getApp(MDD.getCurrentUser());
            log.debug("app " + app.getName() + " loaded");
            break;
        }
        return app;
    }

    public boolean isSearchAvailable() {
        return false;
    }

    public boolean isFavouritesAvailable() {
        return false;
    }

    public boolean isLastEditedAvailable() {
        return false;
    }

    public void getFavourites(UserData user, Callback<Data> callback) {
        callback.onFailure(new Exception("Favourites are not available for this app."));
    }

    public void search(UserData user, Callback<Data> callback) {
        callback.onFailure(new Exception("Search is not available for this app."));
    }

    public void getLastEdited(UserData user, Callback<Data> callback) {
        callback.onFailure(new Exception("Search is not available for this app."));
    }


    public abstract String getName();

    public boolean isChartsEnabled() {
        return false;
    }

    public boolean isAuthenticationNeeded() {

        boolean hasPrivateContent = false;
        for (AbstractArea a : buildAreas()) {
            if (!a.isPublicAccess()) {
                hasPrivateContent = true;
            }
            if (hasPrivateContent) break;
        }
        return hasPrivateContent;

    }

    public boolean isAuthenticationAgnostic() {
        return false;
    }


    public String getAreaId(AbstractArea area) {
        return areaIds.get(area);
    }

    public AbstractArea getArea(String id) {
        return areaIdsReversed.get(id);
    }

    public String getMenuId(MenuEntry menu) {
        return menuIds.get(menu);
    }

    public MenuEntry getMenu(String id) {
        return menuIdsReversed.get(id);
    }

    public String getModuleId(AbstractModule m) {
        return moduleIds.get(m);
    }

    public AbstractArea getArea(AbstractModule m) {
        return moduleToArea.get(m);
    }

    public AbstractModule getModule(String id) {
        return moduleIdsReversed.get(id);
    }


    public String getState(AbstractArea a) {
        if (a == null) return (MDD.getUserData() == null)?"public":"private";
        return getAreaId(a);
    }

    public String getState(MenuEntry e) {
        return getMenuId(e);
    }

    public String getState(AbstractModule m) {
        return getModuleId(m);
    }


    public List<MenuEntry> getPath(MenuEntry e) {
        return menuPaths.get(e);
    }

    public boolean isSignUpSupported() {
        return false;
    }

    public void updateSession() {
        this.areas = null;
        buildAreaAndMenuIds();
    }


    public List<AbstractArea> getAreas() {
        if (areas == null) synchronized (this) {
            areas = new ArrayList<>();
            boolean autentico = MDD.getUserData() != null;
            for (AbstractArea a : buildAreas()) {
                if (isAuthenticationAgnostic() || (!autentico && a.isPublicAccess()) || (autentico && !a.isPublicAccess())) areas.add(a);
            }
        }
        return areas;
    }


    public synchronized void buildAreaAndMenuIds() {
        areaIds = new HashMap<>();
        areaIdsReversed = new HashMap<>();
        menuIds = new HashMap<>();
        menuIdsReversed = new HashMap<>();
        moduleIds = new HashMap<>();
        moduleIdsReversed = new HashMap<>();
        menuPaths = new HashMap<>();
        menuToArea = new HashMap<>();
        moduleToArea = new HashMap<>();

        for (AbstractArea a : getAreas()) {

            String areaName = a.getName();
            if (Strings.isNullOrEmpty(areaName)) areaName = "noname";

            String id = ((a.isPublicAccess())?"public":"private") + "/" + areaName.toLowerCase().replaceAll(" ", "").replaceAll("&", "");
            int pos = 0;
            String idbase = id;
            while (areaIdsReversed.containsKey(id)) id = idbase + pos++;
            areaIds.put(a, id);
            areaIdsReversed.put(id, a);

            for (AbstractModule m : a.getModules()) {

                String moduleName = m.getName();
                if (Strings.isNullOrEmpty(moduleName)) moduleName = "noname";

                String idm = id + "/" + moduleName.toLowerCase().replaceAll(" ", "").replaceAll("&", "");
                int posm = 0;
                String idbasem = idm;
                while (moduleIdsReversed.containsKey(idm)) idm = idbasem + posm++;
                moduleIds.put(m, idm);
                moduleIdsReversed.put(idm, m);
                moduleToArea.put(m, a);

                for (MenuEntry e : m.getMenu()) {
                    buildMenuIds(a, idm, new ArrayList<>(), e);
                }
            }
        }
        MDDUI.get().getNavegador().getViewProvider().clearStack();
    }

    private void buildMenuIds(AbstractArea a, String prefijo, List<MenuEntry> incomingPath, MenuEntry e) {
        if (a != null && e != null) {
            String id = prefijo + "/" + (e.getCaption() != null?e.getCaption():e.getId()).toLowerCase().replaceAll("/", "").replaceAll(" ", "").replaceAll("&", "");

            int pos = 0;
            String idbase = id;
            while (!"void".equals(id) && menuIdsReversed.containsKey(id)) {
                id = idbase + pos++;
            }
            menuIds.put(e, id);
            menuIdsReversed.put(id, e);
            List<MenuEntry> path = menuPaths.get(e);
            if (path == null) menuPaths.put(e, path = new ArrayList<>());
            path.addAll(incomingPath);

            menuToArea.put(e, a);

            if (e instanceof AbstractMenu) {
                List<MenuEntry> outgoingPath = new ArrayList<>(path);
                outgoingPath.add(e);
                for (MenuEntry x : ((AbstractMenu) e).getEntries()) {
                    buildMenuIds(a, id, outgoingPath, x);
                }
            }
        }
    }

    public abstract List<AbstractArea> buildAreas();

    public View getPublicHome() { return null; };

    public View getPrivateHome() { return null; };

    public String getBaseUrl() {
        String u = System.getProperty("baseurl", MDDUI.get() != null?MDDUI.get().getBaseUrl():"");
        if (u.endsWith("app/")) u = u.substring(0, u.lastIndexOf("app/"));
        return u;
    };




    public String getPort() {
        return port;
    }

    public void setPort(String port) {
        this.port = port;
    }

    public List<String> getSupportedLanguages() {
        return null;
    }

    public String getOriginLanguage() {
        return null;
    }

    public String translate(String text, String toLanguage) {
        return null;
    }

    public void askForTranslation(String text, String fromLanguage, String toLanguage) {

    }

    public MemorizadorRegistroEditado getMemorizador() {
        if (memorizador == null) {
            memorizador = new MemorizadorRegistroEditado() {
                @Override
                public void recordar(UserData userData, boolean isNew, String name, String sourceUri, Object id) {
                    new Thread(new Runnable() {
                        @Override
                        public void run() {

                            try {

                                Helper.transact(new JPATransaction() {
                                    @Override
                                    public void run(EntityManager em) throws Throwable {

                                        EditedRecord r = new EditedRecord();

                                        r.setIcon((isNew)?"new":"edit");
                                        r.setName(name);
                                        if (userData != null && !Strings.isNullOrEmpty(userData.getLogin())) r.setUser(em.find(User.class, userData.getLogin()));

                                        String u = sourceUri;

                                        if (isNew) {
                                            u += "/";
                                            if (id instanceof String) u += "s" + id;
                                            else if (id instanceof Long) u += "l" + id;
                                            else if (id instanceof Integer) u += "i" + id;
                                        }

                                        r.setUri(u);

                                        em.persist(r);

                                    }
                                });

                            } catch (Throwable throwable) {
                                throwable.printStackTrace();
                            }

                        }
                    }).start();
                }
            };
        }
        return memorizador;
    }

    public void setMemorizador(MemorizadorRegistroEditado memorizador) {
        this.memorizador = memorizador;
    }


    public boolean hasPublicContent() {
        boolean r = !isAuthenticationNeeded() && (areas == null || areas.size() == 0);
        for (AbstractArea a : areas) {
            if (a.isPublicAccess()) {
                r = true;
                break;
            }
        }
        return r;
    }

    public boolean hasPrivateContent() {
        boolean r = false;
        for (AbstractArea a : buildAreas()) {
            if (!a.isPublicAccess()) {
                r = true;
                break;
            }
        }
        return r;
    }

    public AbstractArea getDefaultPrivateArea() {
        AbstractArea area = null;
        for (AbstractArea a : areas) {
            if (isAuthenticationAgnostic() || !a.isPublicAccess()) {
                area = a;
                break;
            }
        }
        return area;
    }

    public AbstractArea getDefaultPublicArea() {
        AbstractArea area = null;
        for (AbstractArea a : areas) {
            if (isAuthenticationAgnostic() || a.isPublicAccess()) {
                area = a;
                break;
            }
        }
        return area;
    }



    public Class<? extends AppConfig> getAppConfigClass() {
        return AppConfig.class;
    }

    public Class<? extends User> getUserClass() {
        return User.class;
    }

    public Populator getPopulator() {
        return new Populator();
    }


    private static Map<String, AbstractFieldBuilder> fieldBuildersCache = new HashMap<>();


    public AbstractFieldBuilder getFieldBuilder(FieldInterfaced field) {

        String k = ((field.getDeclaringClass() != null)?field.getDeclaringClass().getName() + "/" + field.getName() + "/" + (MDDUI.get().isEditingNewRecord()?"newrecord":"editing"):field.getType().getName());

        if (fieldBuildersCache.containsKey(k)) return fieldBuildersCache.get(k);
        else {
            AbstractFieldBuilder r = null;
            for (AbstractFieldBuilder b : AbstractFieldBuilder.builders) if (b.isSupported(field)) {
                r = b;
                break;
            }
            fieldBuildersCache.put(k, r);
            return r;
        }
    }

    public Searcher getSearcher() {
        return new Searcher();
    }

}
