package io.mateu.mdd.core.app;


import com.google.common.base.Strings;
import io.mateu.mdd.core.data.Data;
import io.mateu.mdd.core.data.UserData;
import io.mateu.mdd.core.interfaces.App;
import io.mateu.mdd.core.interfaces.View;
import io.mateu.mdd.core.model.authentication.User;
import io.mateu.mdd.core.model.ui.EditedRecord;
import io.mateu.mdd.core.nose.MemorizadorRegistroEditado;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.util.JPATransaction;

import javax.persistence.EntityManager;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by miguel on 8/8/16.
 */
public abstract class AbstractApplication implements App {

    public static final String PORT_VAADIN = "vaadin";
    public static final String PORT_JAVAFX = "javafx";


    private UserData userData;
    private String baseUrl;
    private String port;
    private Map<AbstractArea, String> areaIds;
    private Map<MenuEntry, AbstractArea> menuToArea;
    private Map<MenuEntry, String> menuIds;
    private Map<String, AbstractArea> areaIdsReversed;
    private Map<String, MenuEntry> menuIdsReversed;
    private Map<MenuEntry, List<MenuEntry>> menuPaths;
    List<AbstractArea> areas = null;

    private MemorizadorRegistroEditado memorizador;

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



    public String getAreaId(AbstractArea area) {
        if (areaIds == null) buildAreaAndMenuIds();
        return areaIds.get(area);
    }

    public AbstractArea getArea(String id) {
        if (areaIdsReversed == null) buildAreaAndMenuIds();
        return areaIdsReversed.get(id);
    }

    public String getMenuId(MenuEntry menu) {
        if (menuIds == null) buildAreaAndMenuIds();
        return menuIds.get(menu);
    }

    public MenuEntry getMenu(String id) {
        if (menuIdsReversed == null) buildAreaAndMenuIds();
        return menuIdsReversed.get(id);
    }

    public String getState(AbstractArea a) {
        String u = "";

        u += getAreaId(a);

        return u;
    }

    public String getState(MenuEntry e) {
        String u = "";

        if (menuToArea == null) buildAreaAndMenuIds();

        u += getAreaId(menuToArea.get(e));

        u += "/";

        u += getMenuId(e);

        return u;
    }

    public List<MenuEntry> getPath(MenuEntry e) {
        if (menuPaths == null) buildAreaAndMenuIds();
        return menuPaths.get(e);
    }

    public boolean isSignUpSupported() {
        return false;
    }

    public List<AbstractArea> getAreas() {
        if (areas == null) synchronized (this) {
            areas = new ArrayList<>();
            boolean autentico = getUserData() != null;
            for (AbstractArea a : buildAreas()) {
                if ((!autentico && a.isPublicAccess()) || (autentico && !a.isPublicAccess())) areas.add(a);
            }
        }
        return areas;
    }


    public synchronized void buildAreaAndMenuIds() {
        areaIds = new HashMap<>();
        menuIds = new HashMap<>();
        areaIdsReversed = new HashMap<>();
        menuIdsReversed = new HashMap<>();
        menuPaths = new HashMap<>();
        menuToArea = new HashMap<>();

        for (AbstractArea a : getAreas()) {
            String id = a.getName().toLowerCase().replaceAll(" ", "");
            int pos = 0;
            String idbase = id;
            while (areaIdsReversed.containsKey(id)) id = idbase + pos++;
            areaIds.put(a, id);
            areaIdsReversed.put(id, a);

            for (AbstractModule m : a.getModules()) {
                for (MenuEntry e : m.getMenu()) {
                    buildMenuIds(a,id + "__", new ArrayList<>(), e);
                }
            }
        }
    }

    private void buildMenuIds(AbstractArea a, String prefijo, List<MenuEntry> incomingPath, MenuEntry e) {
        String id = e.getName().toLowerCase().replaceAll(" ", "");

        int pos = 0;
        String mid = prefijo + id;
        String idbase = mid;
        while (!"void".equals(mid) && menuIdsReversed.containsKey(mid)) {
            mid = idbase + pos++;
        }
        menuIds.put(e, mid);
        menuIdsReversed.put(mid, e);
        List<MenuEntry> path = menuPaths.get(e);
        if (path == null) menuPaths.put(e, path = new ArrayList<>());
        path.addAll(incomingPath);

        menuToArea.put(e, a);

        if (e instanceof AbstractMenu) {
            prefijo += id + "__";
            List<MenuEntry> outgoingPath = new ArrayList<>(path);
            outgoingPath.add(e);
            for (MenuEntry x : ((AbstractMenu) e).getEntries()) {
                buildMenuIds(a, prefijo, outgoingPath, x);
            }
        }

    }

    public abstract List<AbstractArea> buildAreas();

    public void setUserData(UserData userData) {
        this.userData = userData;
        this.areas = null;
        buildAreaAndMenuIds();
    }

    public UserData getUserData() {
        return userData;
    }

    public View getPublicHome() { return null; };

    public View getPrivateHome() { return null; };

    public String getBaseUrl() { return baseUrl; };

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }


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
}
