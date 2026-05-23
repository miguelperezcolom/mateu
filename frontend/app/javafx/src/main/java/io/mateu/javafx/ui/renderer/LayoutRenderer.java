package io.mateu.javafx.ui.renderer;

import com.fasterxml.jackson.databind.JsonNode;
import io.mateu.javafx.ui.AppContext;
import javafx.scene.Node;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.VBox;

public class LayoutRenderer {

    private final AppContext ctx;

    public LayoutRenderer(AppContext ctx) {
        this.ctx = ctx;
    }

    public Node renderHBox(JsonNode component, JsonNode metadata, JsonNode state, JsonNode data) {
        HBox box = new HBox();
        double spacing = metadata.path("spacing").asBoolean(true) ? 12 : 0;
        box.setSpacing(spacing);
        renderChildren(component, state, data, box);
        return box;
    }

    public Node renderVBox(JsonNode component, JsonNode metadata, JsonNode state, JsonNode data) {
        VBox box = new VBox();
        double spacing = metadata.path("spacing").asBoolean(true) ? 12 : 0;
        box.setSpacing(spacing);
        renderChildren(component, state, data, box);
        return box;
    }

    private void renderChildren(JsonNode component, JsonNode state, JsonNode data, javafx.scene.layout.Pane container) {
        JsonNode children = component.path("children");
        if (!children.isArray()) return;
        ComponentRenderer renderer = new ComponentRenderer(ctx);
        for (JsonNode child : children) {
            Node childNode = renderer.render(child, state, data);
            if (container instanceof HBox hbox) {
                HBox.setHgrow(childNode, Priority.SOMETIMES);
            } else if (container instanceof VBox vbox) {
                VBox.setVgrow(childNode, Priority.SOMETIMES);
            }
            container.getChildren().add(childNode);
        }
    }
}
