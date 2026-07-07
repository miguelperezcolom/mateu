package io.mateu.javafx.ui.renderer;

import com.fasterxml.jackson.databind.JsonNode;
import io.mateu.javafx.ui.AppContext;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Node;
import javafx.scene.control.Button;
import javafx.scene.control.ContentDisplay;
import javafx.scene.control.Label;
import javafx.scene.control.ScrollPane;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;

public class AppRenderer {

    private final AppContext ctx;

    public AppRenderer(AppContext ctx) {
        this.ctx = ctx;
    }

    public Node render(JsonNode component, JsonNode appMetadata) {
        String title = appMetadata.path("title").asText("Mateu App");
        String homeRoute = appMetadata.path("homeRoute").asText("");
        String homeConsumedRoute = appMetadata.path("homeConsumedRoute").asText("");
        String homeServerSideType = appMetadata.path("homeServerSideType").asText("").isBlank()
                ? appMetadata.path("serverSideType").asText("") : appMetadata.path("homeServerSideType").asText("");

        if (ctx.primaryStage != null) {
            ctx.primaryStage.setTitle(title);
        }

        String variant = appMetadata.path("variant").asText("NAVIGATION_LAYOUT");

        return switch (variant) {
            case "TABS" -> renderTabs(appMetadata, homeRoute, homeConsumedRoute, homeServerSideType);
            case "MENU_ON_LEFT" -> renderMenuOnLeft(appMetadata, title, homeRoute, homeConsumedRoute, homeServerSideType);
            case "MEDIATOR" -> renderMediator(homeRoute, homeConsumedRoute, homeServerSideType);
            default -> renderNavigationLayout(appMetadata, title, homeRoute, homeConsumedRoute, homeServerSideType);
        };
    }

    private Node renderNavigationLayout(JsonNode appMetadata, String title,
                                         String homeRoute, String homeConsumedRoute, String homeServerSideType) {
        BorderPane root = new BorderPane();

        // Left sidebar
        VBox sidebar = buildSidebar(appMetadata, homeConsumedRoute);
        root.setLeft(sidebar);

        // Top header / shellbar (hamburger toggles the sidebar above)
        HBox header = buildShellbar(title, appMetadata, homeRoute, homeConsumedRoute, homeServerSideType, sidebar);
        root.setTop(header);

        // Content area: a dockable tab pane (inside its StackPane host so TiwulFX can split it).
        // Each menu item opens its own tab (its own AppContext); tabs can be reordered, detached
        // into floating windows and docked/split by drag and drop.
        root.setCenter(ctx.shell.dockHost);

        // Restore the saved workspace (open tabs) or, if none, open the home tab.
        ctx.shell.openInitialTabs("Home", homeRoute, homeConsumedRoute, homeServerSideType);

        return root;
    }

    private Node renderMenuOnLeft(JsonNode appMetadata, String title,
                                   String homeRoute, String homeConsumedRoute, String homeServerSideType) {
        BorderPane root = new BorderPane();

        VBox sidebar = buildSidebar(appMetadata, homeConsumedRoute);
        root.setLeft(sidebar);

        StackPane contentArea = new StackPane();
        contentArea.getStyleClass().add("content-area");
        contentArea.setAlignment(Pos.TOP_LEFT);
        ctx.contentPane = contentArea;
        ctx.registerComponent("ux_main", contentArea);
        root.setCenter(contentArea);

        if (!homeRoute.isBlank() || !homeServerSideType.isBlank()) {
            ctx.navigate(homeRoute, homeConsumedRoute, homeServerSideType, "");
        }

        return root;
    }

    private Node renderTabs(JsonNode appMetadata, String homeRoute, String homeConsumedRoute, String homeServerSideType) {
        StackPane contentArea = new StackPane();
        contentArea.getStyleClass().add("content-area");
        contentArea.setAlignment(Pos.TOP_LEFT);
        ctx.contentPane = contentArea;
        ctx.registerComponent("ux_main", contentArea);

        if (!homeRoute.isBlank() || !homeServerSideType.isBlank()) {
            ctx.navigate(homeRoute, homeConsumedRoute, homeServerSideType, "");
        }

        return contentArea;
    }

    private Node renderMediator(String homeRoute, String homeConsumedRoute, String homeServerSideType) {
        StackPane contentArea = new StackPane();
        contentArea.getStyleClass().add("content-area");
        contentArea.setAlignment(Pos.TOP_LEFT);
        ctx.contentPane = contentArea;
        ctx.registerComponent("ux_main", contentArea);

        if (!homeRoute.isBlank() || !homeServerSideType.isBlank()) {
            ctx.navigate(homeRoute, homeConsumedRoute, homeServerSideType, "");
        }

        return contentArea;
    }

    private HBox buildShellbar(String title, JsonNode appMetadata,
                                String homeRoute, String homeConsumedRoute, String homeServerSideType,
                                Node sidebar) {
        HBox header = new HBox();
        header.getStyleClass().add("app-header");
        header.setAlignment(Pos.CENTER_LEFT);
        header.setSpacing(16);

        Button hamburger = new Button("☰");
        hamburger.getStyleClass().add("hamburger");
        hamburger.setOnAction(e -> {
            boolean show = !sidebar.isVisible();
            sidebar.setVisible(show);
            sidebar.setManaged(show);
        });

        Label titleLabel = new Label(title);
        titleLabel.getStyleClass().add("app-title");
        titleLabel.setStyle("-fx-cursor: hand;");
        titleLabel.setOnMouseClicked(e ->
                ctx.shell.openTab("Home", homeRoute, homeConsumedRoute, homeServerSideType, ""));

        HBox spacer = new HBox();
        HBox.setHgrow(spacer, Priority.ALWAYS);

        header.getChildren().addAll(hamburger, titleLabel, spacer);
        addContextSelectors(header, appMetadata);
        return header;
    }

    /**
     * Application-level context selectors (@AppContext fields of the app class): one ComboBox per
     * selector on the right of the shellbar. Picking a value persists it, updates the appState
     * sent with every request, and reloads every open tab (see AppShell.setAppContext).
     */
    // beyond this many options the selector renders as a searchable picker (like the web one)
    private static final int SEARCHABLE_THRESHOLD = 7;

    private void addContextSelectors(HBox header, JsonNode appMetadata) {
        JsonNode selectors = appMetadata.path("contextSelectors");
        if (!selectors.isArray()) return;
        for (JsonNode selector : selectors) {
            String fieldName = selector.path("fieldName").asText("");
            if (fieldName.isBlank()) continue;
            Label label = new Label(selector.path("label").asText(fieldName));
            label.getStyleClass().add("app-context-label");

            JsonNode selectorOptions = selector.path("options");
            if (selectorOptions.isArray() && selectorOptions.size() > SEARCHABLE_THRESHOLD) {
                header.getChildren().addAll(
                        label, buildSearchableContextPicker(fieldName, selector, appMetadata));
                continue;
            }

            javafx.scene.control.ComboBox<ContextOption> combo = new javafx.scene.control.ComboBox<>();
            combo.getItems().add(new ContextOption("", "—"));
            JsonNode options = selector.path("options");
            if (options.isArray()) {
                for (JsonNode option : options) {
                    combo.getItems().add(new ContextOption(
                            option.path("value").asText(""), option.path("label").asText("")));
                }
            }
            Object current = ctx.shell.appState.get(fieldName);
            String currentValue = current == null ? "" : String.valueOf(current);
            combo.getSelectionModel().select(combo.getItems().stream()
                    .filter(item -> item.value().equals(currentValue))
                    .findFirst()
                    // a persisted value beyond the loaded options still shows (as its raw value)
                    .orElseGet(() -> {
                        if (currentValue.isEmpty()) return combo.getItems().get(0);
                        ContextOption extra = new ContextOption(currentValue, currentValue);
                        combo.getItems().add(extra);
                        return extra;
                    }));
            combo.setOnAction(e -> {
                ContextOption picked = combo.getSelectionModel().getSelectedItem();
                if (picked != null) {
                    ctx.shell.setAppContext(fieldName, picked.value());
                }
            });
            header.getChildren().addAll(label, combo);
        }
    }

    /** ComboBox item for a context option: displays the label, carries the value. */
    private record ContextOption(String value, String label) {
        @Override
        public String toString() {
            return label;
        }
    }

    /**
     * Searchable picker for context selectors with many options (mirrors the web
     * mateu-app-context-picker): a MenuButton whose popup holds a search field + option list.
     * Typing filters the loaded options client-side and (debounced 300ms) asks the server for
     * real matches beyond the loaded page via the {@code _appcontext-search-<field>} action.
     */
    private Node buildSearchableContextPicker(String fieldName, JsonNode selector, JsonNode appMetadata) {
        JsonNode loadedOptions = selector.path("options");

        Object current = ctx.shell.appState.get(fieldName);
        String currentValue = current == null ? "" : String.valueOf(current);
        String currentLabel = currentValue.isEmpty() ? "—" : currentValue;
        if (loadedOptions.isArray()) {
            for (JsonNode option : loadedOptions) {
                if (option.path("value").asText("").equals(currentValue)) {
                    currentLabel = option.path("label").asText(currentValue);
                }
            }
        }

        javafx.scene.control.MenuButton button = new javafx.scene.control.MenuButton(currentLabel);

        javafx.scene.control.TextField search = new javafx.scene.control.TextField();
        search.setPromptText("Search…");
        javafx.scene.control.ListView<ContextOption> list = new javafx.scene.control.ListView<>();
        list.setPrefHeight(220);
        java.util.List<ContextOption> loaded = new java.util.ArrayList<>();
        loaded.add(new ContextOption("", "—"));
        if (loadedOptions.isArray()) {
            for (JsonNode option : loadedOptions) {
                loaded.add(new ContextOption(
                        option.path("value").asText(""), option.path("label").asText("")));
            }
        }
        list.getItems().setAll(loaded);

        // server results replacing the loaded options while a remote search is active
        java.util.List<ContextOption> searched = new java.util.ArrayList<>();
        Runnable refilter = () -> {
            String text = search.getText() == null ? "" : search.getText().trim().toLowerCase();
            java.util.List<ContextOption> base = searched.isEmpty() ? loaded : searched;
            if (text.isEmpty()) {
                list.getItems().setAll(loaded);
                return;
            }
            list.getItems().setAll(base.stream()
                    .filter(option -> option.label().toLowerCase().contains(text))
                    .toList());
        };

        javafx.animation.PauseTransition debounce =
                new javafx.animation.PauseTransition(javafx.util.Duration.millis(300));
        search.textProperty().addListener((obs, old, text) -> {
            refilter.run();
            debounce.setOnFinished(e -> remoteContextSearch(fieldName, appMetadata, text, searched, refilter));
            debounce.playFromStart();
        });

        list.getSelectionModel().selectedItemProperty().addListener((obs, old, picked) -> {
            if (picked == null) return;
            button.setText(picked.value().isEmpty() ? "—" : picked.label());
            button.hide();
            ctx.shell.setAppContext(fieldName, picked.value());
        });

        VBox panel = new VBox(6, search, list);
        panel.setPadding(new Insets(6));
        javafx.scene.control.CustomMenuItem item = new javafx.scene.control.CustomMenuItem(panel, false);
        button.getItems().add(item);
        button.setOnShowing(e -> javafx.application.Platform.runLater(search::requestFocus));
        return button;
    }

    /** Asks the server for context options matching {@code text}; updates {@code searched} on the FX thread. */
    private void remoteContextSearch(String fieldName, JsonNode appMetadata, String text,
                                     java.util.List<ContextOption> searched, Runnable refilter) {
        String route = appMetadata.path("homeRoute").asText("");
        String serverSideType = appMetadata.path("serverSideType").asText("");
        Thread worker = new Thread(() -> {
            try {
                JsonNode increment = ctx.apiClient.runAction(
                        route,
                        route,
                        "_appcontext-search-" + fieldName,
                        serverSideType.isBlank() ? null : serverSideType,
                        "appcontext-" + fieldName,
                        java.util.Map.of(),
                        ctx.shell.appState,
                        java.util.Map.of("searchText", text == null ? "" : text));
                java.util.List<ContextOption> results = new java.util.ArrayList<>();
                for (JsonNode fragment : increment.path("fragments")) {
                    JsonNode content = fragment.path("data").path("_appcontext_" + fieldName).path("content");
                    if (content.isArray()) {
                        for (JsonNode option : content) {
                            results.add(new ContextOption(
                                    option.path("value").asText(""),
                                    option.path("label").asText(option.path("value").asText(""))));
                        }
                    }
                }
                if (!results.isEmpty()) {
                    javafx.application.Platform.runLater(() -> {
                        searched.clear();
                        searched.addAll(results);
                        refilter.run();
                    });
                }
            } catch (Exception ignored) {
                // server search unavailable: the client-side filter still applies
            }
        }, "appcontext-search");
        worker.setDaemon(true);
        worker.start();
    }

    private VBox buildSidebar(JsonNode appMetadata, String defaultConsumedRoute) {
        VBox sidebar = new VBox();
        sidebar.getStyleClass().add("sidebar");

        ScrollPane scroll = new ScrollPane(sidebar);
        scroll.setFitToWidth(true);
        scroll.setHbarPolicy(ScrollPane.ScrollBarPolicy.NEVER);
        scroll.setStyle("-fx-background-color: #354a5e; -fx-background: #354a5e;");

        JsonNode menu = appMetadata.path("menu");
        if (menu.isArray()) {
            for (JsonNode menuItem : menu) {
                addMenuItems(sidebar, menuItem, 0);
            }
        }

        VBox wrapper = new VBox(scroll);
        VBox.setVgrow(scroll, Priority.ALWAYS);
        wrapper.getStyleClass().add("sidebar");
        return wrapper;
    }

    private void addMenuItems(VBox sidebar, JsonNode menuItem, int depth) {
        String label = menuItem.path("label").asText("");
        boolean separator = menuItem.path("separator").asBoolean(false);
        JsonNode submenus = menuItem.path("submenus");

        if (separator) {
            sidebar.getChildren().add(buildSeparator());
            return;
        }

        boolean hasSubmenus = submenus.isArray() && !submenus.isEmpty();

        if (hasSubmenus) {
            // Collapsible group: a header toggles a (initially collapsed) children container.
            VBox childrenBox = new VBox();
            childrenBox.setVisible(false);
            childrenBox.setManaged(false);

            Label caret = new Label("▸");
            caret.getStyleClass().add("menu-caret");

            Button header = new Button(label);
            header.getStyleClass().add("menu-group");
            header.setGraphic(caret);
            header.setContentDisplay(ContentDisplay.LEFT);
            header.setGraphicTextGap(8);
            header.setAlignment(Pos.CENTER_LEFT);
            header.setPadding(new Insets(10, 20, 10, 20 + depth * 12));
            header.setMaxWidth(Double.MAX_VALUE);
            header.setOnAction(e -> {
                boolean show = !childrenBox.isVisible();
                childrenBox.setVisible(show);
                childrenBox.setManaged(show);
                caret.setText(show ? "▾" : "▸");
            });

            sidebar.getChildren().addAll(header, childrenBox);
            for (JsonNode sub : submenus) {
                addMenuItems(childrenBox, sub, depth + 1);
            }
        } else {
            String route = menuItem.path("route").asText("");
            String consumedRoute = menuItem.path("consumedRoute").asText("");
            String serverSideType = menuItem.path("serverSideType").asText("");
            String actionId = menuItem.path("actionId").asText("");

            Button btn = new Button(label);
            btn.getStyleClass().add("menu-item");
            btn.setPadding(new Insets(10, 20, 10, 20 + depth * 12));
            btn.setMaxWidth(Double.MAX_VALUE);
            btn.setAlignment(Pos.CENTER_LEFT);
            btn.setOnAction(e -> ctx.shell.openTab(label, route, consumedRoute, serverSideType, actionId));
            sidebar.getChildren().add(btn);
        }
    }

    private Node buildSeparator() {
        Region sep = new Region();
        sep.setMinHeight(1);
        sep.setMaxHeight(1);
        sep.setStyle("-fx-background-color: #4a6070;");
        sep.setPadding(new Insets(4, 0, 4, 0));
        VBox wrapper = new VBox(sep);
        wrapper.setPadding(new Insets(4, 0, 4, 0));
        return wrapper;
    }
}
