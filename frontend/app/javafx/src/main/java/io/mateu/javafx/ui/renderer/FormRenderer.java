package io.mateu.javafx.ui.renderer;

import com.fasterxml.jackson.databind.JsonNode;
import io.mateu.javafx.ui.AppContext;
import javafx.geometry.Insets;
import javafx.scene.Node;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.ScrollPane;
import javafx.scene.layout.*;

public class FormRenderer {

    private final AppContext ctx;

    public FormRenderer(AppContext ctx) {
        this.ctx = ctx;
    }

    public Node render(JsonNode component, JsonNode formMetadata, JsonNode state, JsonNode data) {
        String title = formMetadata.path("title").asText("");
        String subtitle = formMetadata.path("subtitle").asText("");
        boolean readOnly = formMetadata.path("readOnly").asBoolean(false);

        BorderPane root = new BorderPane();
        root.getStyleClass().add("content-area");

        // Header
        if (!title.isBlank() || !subtitle.isBlank()) {
            VBox header = new VBox(4);
            if (!title.isBlank()) {
                Label titleLabel = new Label(title);
                titleLabel.getStyleClass().add("form-title");
                header.getChildren().add(titleLabel);
            }
            if (!subtitle.isBlank()) {
                Label subtitleLabel = new Label(subtitle);
                subtitleLabel.getStyleClass().add("form-subtitle");
                header.getChildren().add(subtitleLabel);
            }

            // Top actions
            JsonNode actions = formMetadata.path("actions");
            if (actions.isArray() && !actions.isEmpty() && !readOnly) {
                HBox actionBar = new HBox(8);
                actionBar.setPadding(new Insets(8, 0, 0, 0));
                for (JsonNode action : actions) {
                    Button btn = buildActionButton(action);
                    actionBar.getChildren().add(btn);
                }
                header.getChildren().add(actionBar);
            }

            header.setPadding(new Insets(0, 0, 16, 0));
            root.setTop(header);
        }

        // Fields (children of the component)
        JsonNode children = component.path("children");
        GridPane grid = new GridPane();
        grid.setHgap(16);
        grid.setVgap(12);
        grid.setPadding(new Insets(8, 0, 8, 0));

        int totalColumns = formMetadata.path("formColumns").asInt(2);
        if (totalColumns <= 0) totalColumns = 2;

        // Make columns stretch
        for (int i = 0; i < totalColumns; i++) {
            ColumnConstraints cc = new ColumnConstraints();
            cc.setHgrow(Priority.ALWAYS);
            grid.getColumnConstraints().add(cc);
        }

        int col = 0;
        int row = 0;

        if (children.isArray()) {
            for (JsonNode child : children) {
                Node fieldNode = renderChild(child, state, data);
                if (fieldNode == null) continue;

                JsonNode childMeta = child.path("metadata");
                int colspan = Math.max(1, childMeta.path("colspan").asInt(1));
                colspan = Math.min(colspan, totalColumns);

                if (col + colspan > totalColumns) {
                    col = 0;
                    row++;
                }

                grid.add(fieldNode, col, row, colspan, 1);
                col += colspan;
                if (col >= totalColumns) {
                    col = 0;
                    row++;
                }
            }
        }

        ScrollPane scroll = new ScrollPane(grid);
        scroll.setFitToWidth(true);
        scroll.setStyle("-fx-background-color: transparent; -fx-background: transparent;");
        root.setCenter(scroll);

        // Bottom buttons
        JsonNode buttons = formMetadata.path("buttons");
        if (buttons.isArray() && !buttons.isEmpty() && !readOnly) {
            HBox bottomBar = new HBox(8);
            bottomBar.getStyleClass().add("action-bar");
            for (JsonNode btn : buttons) {
                bottomBar.getChildren().add(buildButtonFromDto(btn));
            }
            root.setBottom(bottomBar);
        }

        return root;
    }

    private Node renderChild(JsonNode child, JsonNode state, JsonNode data) {
        String type = child.path("type").asText("ClientSide");
        if ("ServerSide".equals(type)) {
            return ctx.loadServerSideComponent(child);
        }
        JsonNode metadata = child.path("metadata");
        String metaType = metadata.path("type").asText("");
        return switch (metaType) {
            case "FormField" -> new FormFieldRenderer(ctx).render(metadata, state, data);
            case "HorizontalLayout" -> new LayoutRenderer(ctx).renderHBox(child, metadata, state, data);
            case "VerticalLayout" -> new LayoutRenderer(ctx).renderVBox(child, metadata, state, data);
            case "Button" -> buildClientButton(metadata);
            case "Text" -> {
                Label l = new Label(metadata.path("text").asText(""));
                l.setWrapText(true);
                yield l;
            }
            default -> new ComponentRenderer(ctx).render(child, state, data);
        };
    }

    private Button buildActionButton(JsonNode action) {
        String id = action.path("id").asText("");
        String label = action.path("label").asText(id);
        Button btn = new Button(label);
        btn.getStyleClass().add("btn-primary");
        btn.setOnAction(e -> ctx.runAction(id, null));
        return btn;
    }

    private Button buildButtonFromDto(JsonNode btn) {
        String id = btn.path("id").asText("");
        String label = btn.path("label").asText(id);
        Button button = new Button(label);
        button.getStyleClass().add("btn-default");
        boolean primary = "Primary".equals(btn.path("buttonStyle").asText(""))
                || "primary".equals(btn.path("buttonStyle").asText(""));
        if (primary) button.getStyleClass().setAll("btn-primary");
        button.setOnAction(e -> ctx.runAction(id, null));
        return button;
    }

    private Button buildClientButton(JsonNode metadata) {
        String id = metadata.path("id").asText("");
        String label = metadata.path("label").asText(id);
        String actionId = metadata.path("actionId").asText(id);
        Button btn = new Button(label);
        btn.getStyleClass().add("btn-default");
        btn.setOnAction(e -> ctx.runAction(actionId, null));
        return btn;
    }
}
