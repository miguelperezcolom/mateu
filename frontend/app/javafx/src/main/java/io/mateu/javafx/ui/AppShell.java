package io.mateu.javafx.ui;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.panemu.tiwulfx.control.dock.DetachableTab;
import com.panemu.tiwulfx.control.dock.DetachableTabPane;
import io.mateu.javafx.api.MateuApiClient;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.control.Tab;
import javafx.scene.layout.StackPane;
import javafx.stage.Stage;

import java.util.HashMap;
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

        // Empty-state hint shown behind the tab pane when no tab is open.
        Label empty = new Label("Open a screen from the menu");
        empty.getStyleClass().add("empty-hint");
        empty.visibleProperty().bind(javafx.beans.binding.Bindings.isEmpty(tabPane.getTabs()));
        dockHost.getChildren().addAll(empty, tabPane);
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
        tab.setOnClosed(e -> tabsByKey.remove(key));
        tabsByKey.put(key, tab);
        tabPane.getSelectionModel().select(tab);

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
}
