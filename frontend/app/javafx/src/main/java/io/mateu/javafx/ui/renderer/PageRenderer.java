package io.mateu.javafx.ui.renderer;

import com.fasterxml.jackson.databind.JsonNode;
import io.mateu.javafx.ui.AppContext;
import javafx.geometry.Insets;
import javafx.scene.Node;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.ScrollPane;
import javafx.scene.layout.*;

public class PageRenderer {

    private final AppContext ctx;

    public PageRenderer(AppContext ctx) {
        this.ctx = ctx;
    }

    public Node render(JsonNode component, JsonNode metadata, JsonNode state, JsonNode data) {
        BorderPane root = new BorderPane();
        root.getStyleClass().add("content-area");

        // Header
        String title = metadata.path("title").asText("");
        String subtitle = metadata.path("subtitle").asText("");
        String pageTitle = metadata.path("pageTitle").asText("");
        String headerText = !title.isBlank() ? title : pageTitle;

        JsonNode toolbar = metadata.path("toolbar");
        boolean hasToolbar = toolbar.isArray() && !toolbar.isEmpty();

        if (!headerText.isBlank() || !subtitle.isBlank() || hasToolbar) {
            VBox header = new VBox(4);
            header.setPadding(new Insets(0, 0, 16, 0));
            if (!headerText.isBlank()) {
                Label titleLabel = new Label(headerText);
                titleLabel.getStyleClass().add("form-title");
                header.getChildren().add(titleLabel);
            }
            if (!subtitle.isBlank()) {
                Label subtitleLabel = new Label(subtitle);
                subtitleLabel.getStyleClass().add("form-subtitle");
                header.getChildren().add(subtitleLabel);
            }
            if (hasToolbar) {
                HBox toolbarBar = new HBox(8);
                toolbarBar.setPadding(new Insets(8, 0, 0, 0));
                toolbarBar.getStyleClass().add("action-bar");
                for (JsonNode btn : toolbar) {
                    toolbarBar.getChildren().add(buildButton(btn));
                }
                header.getChildren().add(toolbarBar);
            }
            root.setTop(header);
        }

        // Children
        VBox body = new VBox(12);
        body.setPadding(new Insets(8, 0, 8, 0));
        JsonNode children = component.path("children");
        if (children.isArray()) {
            ComponentRenderer childRenderer = new ComponentRenderer(ctx);
            for (JsonNode child : children) {
                body.getChildren().add(childRenderer.render(child, state, data));
            }
        }

        ScrollPane scroll = new ScrollPane(body);
        scroll.setFitToWidth(true);
        scroll.setStyle("-fx-background-color: transparent; -fx-background: transparent;");
        root.setCenter(scroll);

        // Bottom buttons
        JsonNode buttons = metadata.path("buttons");
        if (buttons.isArray() && !buttons.isEmpty()) {
            HBox bar = new HBox(8);
            bar.getStyleClass().add("action-bar");
            for (JsonNode btn : buttons) {
                bar.getChildren().add(buildButton(btn));
            }
            root.setBottom(bar);
        }

        return root;
    }

    private Button buildButton(JsonNode btn) {
        // ButtonDto uses "actionId"; fall back to "id" for ActionDto / other shapes
        String actionId = btn.path("actionId").asText(btn.path("id").asText(""));
        String label = btn.path("label").asText(actionId);
        Button button = new Button(label);
        boolean primary = "Primary".equalsIgnoreCase(btn.path("buttonStyle").asText(""));
        button.getStyleClass().add(primary ? "btn-primary" : "btn-default");
        button.setOnAction(e -> ctx.runAction(actionId, null));
        return button;
    }
}
