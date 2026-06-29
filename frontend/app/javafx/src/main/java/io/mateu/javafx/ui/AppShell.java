package io.mateu.javafx.ui;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.panemu.tiwulfx.control.dock.DetachableTab;
import com.panemu.tiwulfx.control.dock.DetachableTabPane;
import com.panemu.tiwulfx.control.dock.DetachableTabPaneFactory;
import io.mateu.javafx.api.MateuApiClient;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.control.Tab;
import javafx.scene.layout.StackPane;
import javafx.stage.Stage;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Shared, application-wide state and services. There is a single {@code AppShell} for the whole
 * app; each open tab gets its own {@link AppContext} (its own navigation/route/component state),
 * so multiple views live side by side. The dockable container is a TiwulFX {@link DetachableTabPane}
 * whose tabs can be reordered, detached into floating windows and docked/split by drag and drop.
 */
public class AppShell {

    public final MateuApiClient apiClient;
    public final String baseUrl;
    public final ObjectMapper mapper = new ObjectMapper();
    public final Map<String, Object> appState = new HashMap<>();

    public Stage primaryStage;

    public final DetachableTabPane tabPane = new DetachableTabPane();
    /**
     * Host for the tab pane. TiwulFX implements docking/splitting by replacing the
     * {@link DetachableTabPane} in its parent with a {@code SplitPane}; it supports re-parenting
     * inside {@code StackPane}/{@code Pane}/{@code SplitPane}, but NOT {@code BorderPane}. So the
     * tab pane must live inside this StackPane (this host stays put as the layout's center).
     */
    public final StackPane dockHost = new StackPane();
    private final Map<String, Tab> tabsByKey = new HashMap<>();

    public AppShell(String baseUrl) {
        this.baseUrl = baseUrl;
        this.apiClient = new MateuApiClient(baseUrl, UUID.randomUUID().toString());

        tabPane.setCloseIfEmpty(false);
        // Floating (detached) windows must carry the app stylesheet so content stays styled.
        tabPane.setSceneFactory(pane -> {
            Scene scene = new Scene(pane, 900, 650);
            var css = AppShell.class.getResource("/app.css");
            if (css != null) scene.getStylesheets().add(css.toExternalForm());
            return scene;
        });

        // Panes created by detaching/splitting (incl. floating windows) should close when they
        // become empty — unlike the main pane (closeIfEmpty=false, which keeps the empty-state
        // hint). The factory also carries over the scene/scope so detached windows stay styled
        // and dockable, and propagates itself so panes split off them behave the same.
        tabPane.setDetachableTabPaneFactory(new DetachableTabPaneFactory() {
            @Override
            protected void init(DetachableTabPane newPane) {
                newPane.setCloseIfEmpty(true);
                newPane.setSceneFactory(tabPane.getSceneFactory());
                newPane.setStageFactory(tabPane.getStageFactory());
                newPane.setStageOwnerFactory(tabPane.getStageOwnerFactory());
                newPane.setScope(tabPane.getScope());
                newPane.setDetachableTabPaneFactory(this);
            }
        });

        // Empty-state hint shown behind the tab pane when no tab is open.
        Label empty = new Label("Open a screen from the menu");
        empty.getStyleClass().add("empty-hint");
        empty.visibleProperty().bind(javafx.beans.binding.Bindings.isEmpty(tabPane.getTabs()));
        dockHost.getChildren().addAll(empty, tabPane);

        // Persist the open tabs (and which one is selected) whenever they change, so the workspace
        // is restored on the next launch.
        tabPane.getTabs().addListener((javafx.beans.InvalidationListener) o -> saveLayout());
        tabPane.getSelectionModel().selectedIndexProperty().addListener((o, a, b) -> saveLayout());
    }

    /**
     * Opens a tab for the given route (or activates it if already open), each with its own
     * {@link AppContext}. Navigation that happens <em>inside</em> a tab (CRUD detail, etc.) replaces
     * that tab's content only; other tabs are untouched.
     */
    public void openTab(String label, String route, String consumedRoute,
                        String serverSideType, String actionId) {
        String key = (serverSideType == null ? "" : serverSideType) + "::" + (route == null ? "" : route);
        Tab existing = tabsByKey.get(key);
        if (existing != null) {
            tabPane.getSelectionModel().select(existing);
            return;
        }

        AppContext ctx = new AppContext(this);
        StackPane content = new StackPane();
        content.getStyleClass().add("content-area");
        ctx.contentPane = content;
        ctx.registerComponent("ux_main", content);

        String text = (label == null || label.isBlank()) ? "—" : label;
        DetachableTab tab = tabPane.addTab(text, content);
        ctx.tab = tab;
        tab.setUserData(new TabRef(text, route, consumedRoute, serverSideType));
        tab.setOnClosed(e -> tabsByKey.remove(key));
        tabsByKey.put(key, tab);
        tabPane.getSelectionModel().select(tab);
        saveLayout(); // persist now that the tab's descriptor (userData) is set

        ctx.navigate(route, consumedRoute, serverSideType, actionId == null ? "" : actionId);
    }

    /** Closes the currently selected tab in the main tab pane (bound to Ctrl/Cmd+W). */
    public void closeSelectedTab() {
        Tab sel = tabPane.getSelectionModel().getSelectedItem();
        if (sel == null) return;
        tabPane.getTabs().remove(sel);
        // Programmatic removal doesn't fire onClosed, so run it to drop the open-tab key.
        if (sel.getOnClosed() != null) sel.getOnClosed().handle(null);
    }

    // ── Layout persistence ─────────────────────────────────────────────────────────
    // Persists the main pane's open tabs across sessions. Detached/split arrangements aren't
    // restored (TiwulFX exposes no API to rebuild them); tabs reopen in the main pane.

    private boolean initialOpened = false;

    /** Restores the saved tabs, or opens the home tab if nothing was saved. Runs once. */
    public void openInitialTabs(String homeLabel, String homeRoute,
                                String homeConsumedRoute, String homeServerSideType) {
        if (initialOpened) return;
        initialOpened = true;
        if (!restoreLayout() && (!homeRoute.isBlank() || !homeServerSideType.isBlank())) {
            openTab(homeLabel, homeRoute, homeConsumedRoute, homeServerSideType, "");
        }
    }

    private File layoutFile() {
        return new File(System.getProperty("user.home"), ".mateu-javafx-layout.json");
    }

    private void saveLayout() {
        if (!initialOpened) return; // don't clobber the saved file before it has been restored
        try {
            List<Map<String, Object>> tabs = new ArrayList<>();
            for (Tab t : tabPane.getTabs()) {
                if (t.getUserData() instanceof TabRef r) tabs.add(r.toMap());
            }
            Map<String, Object> data = new HashMap<>();
            data.put("baseUrl", baseUrl);
            data.put("selected", tabPane.getSelectionModel().getSelectedIndex());
            data.put("tabs", tabs);
            mapper.writeValue(layoutFile(), data);
        } catch (Exception ignored) {
            // Persistence is best-effort; never let it break the UI.
        }
    }

    private boolean restoreLayout() {
        try {
            File f = layoutFile();
            if (!f.exists()) return false;
            JsonNode root = mapper.readTree(f);
            if (!baseUrl.equals(root.path("baseUrl").asText(""))) return false; // different backend
            JsonNode tabs = root.path("tabs");
            if (!tabs.isArray() || tabs.isEmpty()) return false;
            for (JsonNode t : tabs) {
                openTab(t.path("label").asText(""), t.path("route").asText(""),
                        t.path("consumedRoute").asText(""), t.path("serverSideType").asText(""), "");
            }
            int sel = root.path("selected").asInt(0);
            if (sel >= 0 && sel < tabPane.getTabs().size()) {
                tabPane.getSelectionModel().select(sel);
            }
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /** Descriptor stored on each tab so the workspace can be persisted/restored. */
    private record TabRef(String label, String route, String consumedRoute, String serverSideType) {
        Map<String, Object> toMap() {
            Map<String, Object> m = new HashMap<>();
            m.put("label", label == null ? "" : label);
            m.put("route", route == null ? "" : route);
            m.put("consumedRoute", consumedRoute == null ? "" : consumedRoute);
            m.put("serverSideType", serverSideType == null ? "" : serverSideType);
            return m;
        }
    }
}
