package io.mateu.mdd.core.app;


import com.google.common.base.Strings;
import io.mateu.mdd.core.interfaces.View;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.VaadinHelper;
import io.mateu.mdd.shared.interfaces.App;
import io.mateu.mdd.shared.interfaces.IArea;
import io.mateu.mdd.shared.interfaces.IModule;
import io.mateu.mdd.shared.interfaces.MenuEntry;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.shared.reflection.IFieldBuilder;
import io.mateu.util.data.Data;
import lombok.extern.slf4j.Slf4j;

import java.util.*;

/**
 * Created by miguel on 8/8/16.
 */
@Slf4j
public abstract class AbstractApplication implements App {

    private String persistenceUnitName;
    private Map<AbstractArea, String> areaIds;
    private Map<String, AbstractArea> areaIdsReversed;
    private Map<MenuEntry, AbstractArea> menuToArea;
    private Map<MenuEntry, String> menuIds;
    private Map<String, MenuEntry> menuIdsReversed;
    private Map<AbstractModule, String> moduleIds;
    private Map<String, AbstractModule> moduleIdsReversed;
    private Map<IModule, IArea> moduleToArea;
    private Map<MenuEntry, List<MenuEntry>> menuPaths;
    List<IArea> areas = null;

    private String logo;

    public String getLogo() {
        return logo;
    }

    public void setLogo(String logo) {
        this.logo = logo;
    }

    public String getPersistenceUnitName() {
        return persistenceUnitName;
    }

    public void setPersistenceUnitName(String persistenceUnitName) {
        this.persistenceUnitName = persistenceUnitName;
    }

    public static AbstractApplication get() {
        if (!Strings.isNullOrEmpty(System.getProperty("appClassName"))) {
            try {
                Object app = Class.forName(System.getProperty("appClassName")).newInstance();
                if (app instanceof AppProvider) app = ((AppProvider) app).getApp(MDDUIAccessor.getCurrentUser());
                return (AbstractApplication) app;
            } catch (Throwable throwable) {
                throwable.printStackTrace();
            }
        }

        Iterator<App> apps = ServiceLoader.load(App.class).iterator();
        AbstractApplication app = null;
        while (apps.hasNext()) {
            app = (AbstractApplication) apps.next();
            if (app instanceof AppProvider) app = ((AppProvider) app).getApp(MDDUIAccessor.getCurrentUser());
            log.debug("app " + app.getName() + " loaded");
            break;
        }
        return app;
    }

    public void search(Callback<Data> callback) {
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

    public IArea getArea(IModule m) {
        return moduleToArea.get(m);
    }

    public IModule getModule(String id) {
        return (IModule) moduleIdsReversed.get(id);
    }

    public String getState(Object o) {
        if (o instanceof AbstractArea) return getState((AbstractArea) o);
        else if (o instanceof AbstractModule) return getState((AbstractModule) o);
        else return getState((MenuEntry) o);
    }

    public String getState(AbstractArea a) {
        if (a == null) return (MDDUIAccessor.getCurrentUser() == null)?"public":"private";
        return getAreaId(a);
    }

    public String getState(MenuEntry e) {
        return getMenuId(e);
    }

    public String getState(AbstractModule m) {
        return getModuleId(m);
    }


    public void updateSession() {
        this.areas = null;
        buildAreaAndMenuIds();
        MDDUIAccessor.updateSession();
    }


    public IArea[] getAreas() {
        if (true || areas == null) synchronized (this) {
            areas = new ArrayList<>();
            boolean autentico = MDDUIAccessor.getCurrentUserLogin() != null && !"anonymousUser".equals(MDDUIAccessor.getCurrentUserLogin());
            for (AbstractArea a : buildAreas()) {

                if (isAuthenticationAgnostic() || (!autentico && a.isPublicAccess()) || (autentico && !a.isPublicAccess())) areas.add(a);
            }
        }
        return areas.toArray(new IArea[0]);
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
        moduleToArea = new HashMap<IModule, IArea>();

        for (IArea a : getAreas()) {

            String areaName = a.getName();
            if (Strings.isNullOrEmpty(areaName)) areaName = "noname";

            String id = ((a.isPublicAccess())?"public":"private") + "/" + areaName.toLowerCase().replaceAll(" ", "").replaceAll("&", "");
            int pos = 0;
            String idbase = id;
            while (areaIdsReversed.containsKey(id)) id = idbase + pos++;
            areaIds.put((AbstractArea) a, id);
            areaIdsReversed.put(id, (AbstractArea) a);

            for (IModule m : a.getModules()) {

                String moduleName = m.getName();
                if (Strings.isNullOrEmpty(moduleName)) moduleName = "noname";

                String idm = id + "/" + moduleName.toLowerCase().replaceAll(" ", "").replaceAll("&", "");
                int posm = 0;
                String idbasem = idm;
                while (moduleIdsReversed.containsKey(idm)) idm = idbasem + posm++;
                moduleIds.put((AbstractModule) m, idm);
                moduleIdsReversed.put(idm, (AbstractModule) m);
                moduleToArea.put(m, a);

                for (MenuEntry e : m.getMenu()) {
                    buildMenuIds((AbstractArea) a, idm, new ArrayList<>(), e);
                }
            }
        }
        MDDUIAccessor.clearStack();
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
        String u = System.getProperty("baseurl", MDDUIAccessor.getBaseUrl());
        if (u.endsWith(VaadinHelper.getAdaptedUIRootPath())) u = u.substring(0, u.lastIndexOf(VaadinHelper.getAdaptedUIRootPath()));
        return u;
    };

    public String translate(String text, String toLanguage) {
        return null;
    }

    public boolean hasPublicContent() {
        boolean r = !isAuthenticationNeeded() && (areas == null || areas.size() == 0);
        for (IArea a : areas) {
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

    public boolean hasRegistrationForm() {
        return false;
    }

    public AbstractArea getDefaultPrivateArea() {
        AbstractArea area = null;
        for (IArea a : areas) {
            if (!a.isPublicAccess()) {
                area = (AbstractArea) a;
                break;
            }
        }
        return area;
    }

    public AbstractArea getDefaultPublicArea() {
        AbstractArea area = null;
        for (IArea a : areas) {
            if (a.isPublicAccess()) {
                area = (AbstractArea) a;
                break;
            }
        }
        return area;
    }



    private static Map<String, IFieldBuilder> fieldBuildersCache = new HashMap<>();


    public IFieldBuilder getFieldBuilder(FieldInterfaced field) {

        String k = ((field.getDeclaringClass() != null)?field.getDeclaringClass().getName() + "/" + field.getName() + "/" + (MDDUIAccessor.isEditingNewRecord()?"newrecord":"editing"):field.getType().getName());

        if (fieldBuildersCache.containsKey(k)) return fieldBuildersCache.get(k);
        else {
            IFieldBuilder r = MDDUIAccessor.getFieldBuilder(field);
            fieldBuildersCache.put(k, r);
            return r;
        }
    }

    public Searcher getSearcher() {
        return new Searcher();
    }

}
