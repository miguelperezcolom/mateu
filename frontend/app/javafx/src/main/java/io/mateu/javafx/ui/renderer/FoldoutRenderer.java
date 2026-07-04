package io.mateu.javafx.ui.renderer;

import com.fasterxml.jackson.databind.JsonNode;
import io.mateu.javafx.ui.AppContext;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Group;
import javafx.scene.Node;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.ScrollPane;
import javafx.scene.control.Tooltip;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.Region;
import javafx.scene.layout.VBox;

/**
 * Renders the Redwood-style {@code FoldoutLayout}: a fixed overview panel on the left (the child
 * slotted {@code overview}) plus lateral fold-out panels (children slotted {@code panel-N}, one
 * per entry in the metadata {@code panels} list). Closed panels render as a narrow strip with the
 * rotated title; clicking toggles them open/closed (local UI state, no server round-trip) — the
 * JavaFX port of the web {@code mateu-foldout.ts}.
 */
public class FoldoutRenderer {

    private final AppContext ctx;

    public FoldoutRenderer(AppContext ctx) {
        this.ctx = ctx;
    }

    public Node render(JsonNode component, JsonNode metadata, JsonNode state, JsonNode data) {
        ComponentRenderer renderer = new ComponentRenderer(ctx);
        HBox root = new HBox(12);
        root.setMinHeight(320);

        // Fixed overview panel (child with slot=="overview")
        VBox overview = new VBox(8);
        overview.setPadding(new Insets(16));
        overview.setStyle(DashboardRenderer.CARD_SURFACE);
        overview.setPrefWidth(320);
        overview.setMinWidth(240);
        JsonNode overviewChild = childWithSlot(component, "overview");
        if (overviewChild != null) {
            overview.getChildren().add(renderer.render(overviewChild, state, data));
        }
        root.getChildren().add(overview);

        // Rail of fold-out panels; scrolls horizontally when several are open
        HBox rail = new HBox(8);
        rail.setAlignment(Pos.TOP_LEFT);
        JsonNode panels = metadata.path("panels");
        if (panels.isArray()) {
            for (int i = 0; i < panels.size(); i++) {
                JsonNode panelInfo = panels.get(i);
                JsonNode panelChild = childWithSlot(component, "panel-" + i);
                Node content = panelChild != null ? renderer.render(panelChild, state, data) : new VBox();
                addPanel(rail, panelInfo, content);
            }
        }
        ScrollPane railScroller = new ScrollPane(rail);
        railScroller.setFitToHeight(true);
        railScroller.setFitToWidth(true);
        railScroller.setStyle("-fx-background-color: transparent; -fx-background: transparent;");
        railScroller.setVbarPolicy(ScrollPane.ScrollBarPolicy.NEVER);
        HBox.setHgrow(railScroller, Priority.ALWAYS);
        root.getChildren().add(railScroller);
        return root;
    }

    /** Adds the open card and the closed strip for one panel; clicking toggles between them. */
    private void addPanel(HBox rail, JsonNode panelInfo, Node content) {
        String title = panelInfo.path("title").asText("");
        String subtitle = panelInfo.path("subtitle").asText("");
        boolean initiallyOpen = panelInfo.path("open").asBoolean(false);

        // Open card: header (title/subtitle + fold button) above the slotted content
        VBox card = new VBox(8);
        card.setPadding(new Insets(16));
        card.setStyle(DashboardRenderer.CARD_SURFACE);
        card.setPrefWidth(360);
        card.setMinWidth(290);
        HBox header = new HBox(8);
        header.setAlignment(Pos.TOP_LEFT);
        VBox titles = new VBox(2);
        Label t = new Label(title);
        t.setStyle("-fx-font-size: 1.1em; -fx-font-weight: bold;");
        titles.getChildren().add(t);
        if (!subtitle.isBlank()) {
            Label s = new Label(subtitle);
            s.setStyle("-fx-font-size: 12px; -fx-text-fill: #6a6d70;");
            titles.getChildren().add(s);
        }
        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);
        Button fold = new Button("⟨");
        fold.getStyleClass().add("btn-link");
        fold.setTooltip(new Tooltip("Fold"));
        header.getChildren().addAll(titles, spacer, fold);
        card.getChildren().addAll(header, content);
        VBox.setVgrow(content, Priority.ALWAYS);

        // Closed strip: narrow band with the rotated title (Group so layout follows the rotation)
        VBox strip = new VBox(8);
        strip.setAlignment(Pos.TOP_CENTER);
        strip.setPadding(new Insets(8, 0, 8, 0));
        strip.setPrefWidth(44);
        strip.setMinWidth(44);
        strip.setMaxWidth(44);
        strip.setStyle("-fx-background-color: #f7f7f7; -fx-border-color: #d2d2d2; "
                + "-fx-border-radius: 8; -fx-background-radius: 8; -fx-cursor: hand;");
        Label unfold = new Label("⟩");
        unfold.setStyle("-fx-text-fill: #6a6d70;");
        Label vertical = new Label(title);
        vertical.setStyle("-fx-font-size: 12px; -fx-text-fill: #6a6d70;");
        vertical.setRotate(90);
        strip.getChildren().addAll(unfold, new Group(vertical));
        Tooltip.install(strip, new Tooltip(title));

        // Local open/closed state: toggle which of the two nodes is shown
        Runnable open = () -> setShown(card, true, strip, false);
        Runnable close = () -> setShown(card, false, strip, true);
        fold.setOnAction(e -> close.run());
        strip.setOnMouseClicked(e -> open.run());
        if (initiallyOpen) open.run(); else close.run();

        rail.getChildren().addAll(card, strip);
    }

    private void setShown(Node a, boolean showA, Node b, boolean showB) {
        a.setVisible(showA);
        a.setManaged(showA);
        b.setVisible(showB);
        b.setManaged(showB);
    }

    private JsonNode childWithSlot(JsonNode component, String slot) {
        JsonNode children = component.path("children");
        if (!children.isArray()) return null;
        for (JsonNode child : children) {
            if (slot.equals(child.path("slot").asText(""))) return child;
        }
        return null;
    }
}
