package io.mateu.javafx.ui.renderer;

import com.fasterxml.jackson.databind.JsonNode;
import io.mateu.javafx.ui.AppContext;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Node;
import javafx.scene.control.Button;
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

        // Top header / shellbar
        HBox header = buildShellbar(title, appMetadata, homeRoute, homeConsumedRoute, homeServerSideType);
        root.setTop(header);

        // Left sidebar
        VBox sidebar = buildSidebar(appMetadata, homeConsumedRoute);
        root.setLeft(sidebar);

        // Content area
        StackPane contentArea = new StackPane();
        contentArea.getStyleClass().add("content-area");
        contentArea.setAlignment(Pos.TOP_LEFT);
        ctx.contentPane = contentArea;
        ctx.registerComponent("ux_main", contentArea);
        root.setCenter(contentArea);

        // Load home content
        if (!homeRoute.isBlank() || !homeServerSideType.isBlank()) {
            ctx.navigate(homeRoute, homeConsumedRoute, homeServerSideType, "");
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
                                String homeRoute, String homeConsumedRoute, String homeServerSideType) {
        HBox header = new HBox();
        header.getStyleClass().add("app-header");
        header.setAlignment(Pos.CENTER_LEFT);
        header.setSpacing(16);

        Label titleLabel = new Label(title);
        titleLabel.getStyleClass().add("app-title");
        titleLabel.setStyle("-fx-cursor: hand;");
        titleLabel.setOnMouseClicked(e ->
                ctx.navigate(homeRoute, homeConsumedRoute, homeServerSideType, ""));

        HBox spacer = new HBox();
        HBox.setHgrow(spacer, Priority.ALWAYS);

        header.getChildren().addAll(titleLabel, spacer);
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

        if (hasSubmenus && depth == 0) {
            // Group header
            Label groupLabel = new Label(label.toUpperCase());
            groupLabel.getStyleClass().add("menu-group-label");
            sidebar.getChildren().add(groupLabel);
            for (JsonNode sub : submenus) {
                addMenuItems(sidebar, sub, depth + 1);
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
            btn.setOnAction(e -> {
                ctx.navigate(route, consumedRoute, serverSideType, actionId);
            });
            sidebar.getChildren().add(btn);

            if (hasSubmenus) {
                for (JsonNode sub : submenus) {
                    addMenuItems(sidebar, sub, depth + 1);
                }
            }
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
