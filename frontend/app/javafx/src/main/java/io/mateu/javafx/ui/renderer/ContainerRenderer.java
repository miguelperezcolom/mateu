package io.mateu.javafx.ui.renderer;

import com.fasterxml.jackson.databind.JsonNode;
import io.mateu.javafx.ui.AppContext;
import javafx.geometry.Insets;
import javafx.scene.Node;
import javafx.scene.control.Accordion;
import javafx.scene.control.Button;
import javafx.scene.control.Hyperlink;
import javafx.scene.control.Label;
import javafx.scene.control.ProgressBar;
import javafx.scene.control.SplitPane;
import javafx.scene.control.Tab;
import javafx.scene.control.TabPane;
import javafx.scene.control.TitledPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.Region;
import javafx.scene.layout.VBox;

/**
 * Renders the structural/display component types that are not handled inline by
 * {@link ComponentRenderer}: form sections, cards, tabs, accordion, split layout, badges, anchors,
 * progress bars and dialogs — using native JavaFX controls.
 */
public class ContainerRenderer {

    private final AppContext ctx;

    public ContainerRenderer(AppContext ctx) {
        this.ctx = ctx;
    }

    private ComponentRenderer renderer() {
        return new ComponentRenderer(ctx);
    }

    private void addChildren(JsonNode component, JsonNode state, JsonNode data, VBox box) {
        JsonNode children = component.path("children");
        if (children.isArray()) {
            for (JsonNode child : children) box.getChildren().add(renderer().render(child, state, data));
        }
    }

    private VBox childrenBox(JsonNode component, JsonNode state, JsonNode data) {
        VBox box = new VBox(8);
        addChildren(component, state, data, box);
        return box;
    }

    // ── Sections / cards ──────────────────────────────────────────────────────
    public Node renderSection(JsonNode component, JsonNode metadata, JsonNode state, JsonNode data) {
        VBox card = new VBox(8);
        card.getStyleClass().add("mateu-card");
        card.setPadding(new Insets(16));
        card.setStyle("-fx-background-color: white; -fx-border-color: #d2d2d2; -fx-border-radius: 6; -fx-background-radius: 6;");
        String title = metadata.path("title").asText("");
        if (!title.isBlank()) {
            Label t = new Label(title);
            t.setStyle("-fx-font-size: 1.1em; -fx-font-weight: bold;");
            card.getChildren().add(t);
        }
        addChildren(component, state, data, card);
        return card;
    }

    public Node renderSubSection(JsonNode component, JsonNode metadata, JsonNode state, JsonNode data) {
        VBox box = new VBox(6);
        String title = metadata.path("title").asText("");
        if (!title.isBlank()) {
            Label t = new Label(title);
            t.setStyle("-fx-font-weight: bold;");
            box.getChildren().add(t);
        }
        addChildren(component, state, data, box);
        return box;
    }

    public Node renderCard(JsonNode component, JsonNode metadata, JsonNode state, JsonNode data) {
        VBox card = new VBox(8);
        card.setPadding(new Insets(16));
        card.setStyle("-fx-background-color: white; -fx-border-color: #d2d2d2; -fx-border-radius: 6; -fx-background-radius: 6;");
        JsonNode title = metadata.path("title");
        if (title.isTextual() && !title.asText().isBlank()) {
            Label t = new Label(title.asText());
            t.setStyle("-fx-font-size: 1.1em; -fx-font-weight: bold;");
            card.getChildren().add(t);
        } else if (title.isObject()) {
            card.getChildren().add(renderer().render(title, state, data));
        }
        if (metadata.path("content").isObject()) card.getChildren().add(renderer().render(metadata.path("content"), state, data));
        addChildren(component, state, data, card);
        if (metadata.path("footer").isObject()) card.getChildren().add(renderer().render(metadata.path("footer"), state, data));
        return card;
    }

    // ── Tabs ────────────────────────────────────────────────────────────────────
    public Node renderTabs(JsonNode component, JsonNode state, JsonNode data) {
        TabPane pane = new TabPane();
        pane.getStyleClass().add(TabPane.STYLE_CLASS_FLOATING);
        JsonNode children = component.path("children");
        if (children.isArray()) {
            for (JsonNode tabNode : children) {
                String label = tabNode.path("metadata").path("label").asText("");
                Tab tab = new Tab(label);
                tab.setClosable(false);
                tab.setContent(childrenBox(tabNode, state, data));
                pane.getTabs().add(tab);
            }
        }
        return pane;
    }

    // ── Accordion ────────────────────────────────────────────────────────────────
    public Node renderAccordion(JsonNode component, JsonNode state, JsonNode data) {
        Accordion acc = new Accordion();
        JsonNode children = component.path("children");
        if (children.isArray()) {
            for (JsonNode panelNode : children) {
                String label = panelNode.path("metadata").path("label").asText("");
                TitledPane tp = new TitledPane(label, childrenBox(panelNode, state, data));
                acc.getPanes().add(tp);
                if (panelNode.path("metadata").path("active").asBoolean(false)) acc.setExpandedPane(tp);
            }
        }
        return acc;
    }

    // ── Split ─────────────────────────────────────────────────────────────────────
    public Node renderSplit(JsonNode component, JsonNode metadata, JsonNode state, JsonNode data) {
        SplitPane split = new SplitPane();
        if ("vertical".equals(metadata.path("orientation").asText(""))) split.setOrientation(javafx.geometry.Orientation.VERTICAL);
        JsonNode children = component.path("children");
        if (children.isArray()) {
            for (JsonNode child : children) split.getItems().add(renderer().render(child, state, data));
        }
        return split;
    }

    // ── Badge / Anchor / ProgressBar ───────────────────────────────────────────────
    public Node renderBadge(JsonNode metadata) {
        Label badge = new Label(metadata.path("text").asText(""));
        String color = metadata.path("color").asText("");
        String bg = switch (color) {
            case "success" -> "#3e8635";
            case "error", "danger" -> "#c9190b";
            case "warning" -> "#f0ab00";
            case "info" -> "#2b9af3";
            default -> "#6a6e73";
        };
        badge.setStyle("-fx-background-color: " + bg + "; -fx-text-fill: white; -fx-padding: 2 8; -fx-background-radius: 10;");
        return badge;
    }

    public Node renderAnchor(JsonNode metadata) {
        Hyperlink link = new Hyperlink(metadata.path("text").asText(metadata.path("url").asText("")));
        // Internal routes navigate; external links are left inert (no java.awt.Desktop in the module graph).
        String url = metadata.path("url").asText("");
        if (url.startsWith("/")) link.setOnAction(e -> ctx.navigate(url, "", "", null));
        return link;
    }

    public Node renderProgressBar(JsonNode metadata, JsonNode state) {
        double min = metadata.path("min").asDouble(0);
        double max = metadata.path("max").asDouble(1);
        String key = metadata.path("valueKey").asText("");
        double raw = !key.isBlank() && state.has(key) ? state.path(key).asDouble(0) : metadata.path("value").asDouble(0);
        double frac = (max - min) == 0 ? 0 : (raw - min) / (max - min);
        ProgressBar pb = new ProgressBar(Math.max(0, Math.min(1, frac)));
        pb.setMaxWidth(Double.MAX_VALUE);
        return pb;
    }

    // ── Dialog / ConfirmDialog (inline styled panel) ─────────────────────────────────
    private VBox dialogShell(String title) {
        VBox box = new VBox(12);
        box.setPadding(new Insets(20));
        box.setStyle("-fx-background-color: white; -fx-border-color: #8a8d90; -fx-border-radius: 8; -fx-background-radius: 8; -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.2), 12, 0, 0, 4);");
        box.setMaxWidth(560);
        if (title != null && !title.isBlank()) {
            Label t = new Label(title);
            t.setStyle("-fx-font-size: 1.2em; -fx-font-weight: bold;");
            box.getChildren().add(t);
        }
        return box;
    }

    public Node renderDialog(JsonNode component, JsonNode metadata, JsonNode state, JsonNode data) {
        VBox box = dialogShell(metadata.path("headerTitle").asText(""));
        if (metadata.path("content").isObject()) box.getChildren().add(renderer().render(metadata.path("content"), state, data));
        addChildren(component, state, data, box);
        if (metadata.path("footer").isObject()) box.getChildren().add(renderer().render(metadata.path("footer"), state, data));
        return box;
    }

    public Node renderConfirmDialog(JsonNode metadata, JsonNode state, JsonNode data) {
        VBox box = dialogShell(metadata.path("header").asText(""));
        if (metadata.path("content").isObject()) box.getChildren().add(renderer().render(metadata.path("content"), state, data));
        HBox footer = new HBox(8);
        Button ok = new Button(metadata.path("confirmText").asText("OK"));
        ok.getStyleClass().add("btn-primary");
        ok.setOnAction(e -> ctx.runAction(metadata.path("confirmActionId").asText(""), null));
        footer.getChildren().add(ok);
        if (metadata.path("canReject").asBoolean(false)) {
            Button no = new Button(metadata.path("rejectText").asText("No"));
            no.setOnAction(e -> ctx.runAction(metadata.path("rejectActionId").asText(""), null));
            footer.getChildren().add(no);
        }
        if (metadata.path("canCancel").asBoolean(false)) {
            Button cancel = new Button(metadata.path("cancelText").asText("Cancel"));
            cancel.setOnAction(e -> ctx.runAction(metadata.path("cancelActionId").asText(""), null));
            footer.getChildren().add(cancel);
        }
        box.getChildren().add(footer);
        return box;
    }

    public Node wrapScroller(Node node) {
        javafx.scene.control.ScrollPane sp = new javafx.scene.control.ScrollPane(node);
        sp.setFitToWidth(true);
        VBox.setVgrow(sp, Priority.ALWAYS);
        return sp;
    }

    public Region region(Node node) {
        return node instanceof Region r ? r : new VBox(node);
    }
}
