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

        // Open the home tab
        if (!homeRoute.isBlank() || !homeServerSideType.isBlank()) {
            ctx.shell.openTab("Home", homeRoute, homeConsumedRoute, homeServerSideType, "");
        }

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
        return header;
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
