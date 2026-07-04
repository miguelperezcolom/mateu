package io.mateu.javafx.ui.renderer;

import com.fasterxml.jackson.databind.JsonNode;
import io.mateu.javafx.ui.AppContext;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Node;
import javafx.scene.layout.ColumnConstraints;
import javafx.scene.layout.GridPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.Region;
import javafx.scene.layout.VBox;
import javafx.scene.control.Label;

import java.util.HashSet;
import java.util.Set;

/**
 * Renders the dashboard component family: {@code MetricCard} KPI tiles, the {@code Scoreboard}
 * KPI band, titled {@code DashboardPanel} tiles and the {@code DashboardLayout} grid — mirroring
 * the web {@code dashboardRenderer.ts} with native JavaFX controls.
 */
public class DashboardRenderer {

    static final String CARD_SURFACE =
            "-fx-background-color: white; -fx-border-color: #d2d2d2; -fx-border-radius: 8; -fx-background-radius: 8;";

    private final AppContext ctx;

    public DashboardRenderer(AppContext ctx) {
        this.ctx = ctx;
    }

    private ComponentRenderer renderer() {
        return new ComponentRenderer(ctx);
    }

    // ── MetricCard ────────────────────────────────────────────────────────────
    public Node renderMetricCard(JsonNode metadata) {
        VBox card = new VBox(4);
        card.setPadding(new Insets(16));
        String actionId = metadata.path("actionId").asText("");
        boolean clickable = !actionId.isBlank();
        card.setStyle(CARD_SURFACE + (clickable ? " -fx-cursor: hand;" : ""));
        card.setMinWidth(150);

        // Title row: small grey title + optional icon (emoji/text only — icon-font names are skipped)
        HBox titleRow = new HBox(8);
        titleRow.setAlignment(Pos.CENTER_LEFT);
        Label title = new Label(metadata.path("title").asText(""));
        title.setStyle("-fx-font-size: 12px; -fx-text-fill: #6a6d70;");
        titleRow.getChildren().add(title);
        String icon = metadata.path("icon").asText("");
        if (!icon.isBlank() && !icon.contains(":")) {
            Region spacer = new Region();
            HBox.setHgrow(spacer, Priority.ALWAYS);
            Label iconLabel = new Label(icon);
            iconLabel.setStyle("-fx-text-fill: #8a8d90;");
            titleRow.getChildren().addAll(spacer, iconLabel);
        }
        card.getChildren().add(titleRow);

        // Value row: big bold value + small unit
        HBox valueRow = new HBox(5);
        valueRow.setAlignment(Pos.BASELINE_LEFT);
        Label value = new Label(metadata.path("value").asText(""));
        value.setStyle("-fx-font-size: 26px; -fx-font-weight: bold;");
        valueRow.getChildren().add(value);
        String unit = metadata.path("unit").asText("");
        if (!unit.isBlank()) {
            Label unitLabel = new Label(unit);
            unitLabel.setStyle("-fx-font-size: 13px; -fx-text-fill: #6a6d70;");
            valueRow.getChildren().add(unitLabel);
        }
        card.getChildren().add(valueRow);

        // Trend line, colored by direction
        String trend = metadata.path("trend").asText("");
        String trendLabel = metadata.path("trendLabel").asText("");
        if (!trend.isBlank() || !trendLabel.isBlank()) {
            String arrow = switch (trend) {
                case "up" -> "▲ ";
                case "down" -> "▼ ";
                default -> "";
            };
            String color = switch (trend) {
                case "up" -> "#1a7f37";
                case "down" -> "#c5221f";
                default -> "#6a6d70";
            };
            Label trendText = new Label(arrow + trendLabel);
            trendText.setStyle("-fx-font-size: 12px; -fx-text-fill: " + color + ";");
            card.getChildren().add(trendText);
        }

        String description = metadata.path("description").asText("");
        if (!description.isBlank()) {
            Label desc = new Label(description);
            desc.setWrapText(true);
            desc.setStyle("-fx-font-size: 11px; -fx-text-fill: #8a8d90;");
            card.getChildren().add(desc);
        }

        // Clicking dispatches the action through the same mechanism buttons use
        if (clickable) {
            card.setOnMouseClicked(e -> ctx.runAction(actionId, null));
        }
        return card;
    }

    // ── Scoreboard ────────────────────────────────────────────────────────────
    public Node renderScoreboard(JsonNode component, JsonNode state, JsonNode data) {
        HBox band = new HBox(12);
        band.setAlignment(Pos.TOP_LEFT);
        JsonNode children = component.path("children");
        if (children.isArray()) {
            ComponentRenderer renderer = renderer();
            for (JsonNode child : children) {
                Node node = renderer.render(child, state, data);
                HBox.setHgrow(node, Priority.ALWAYS);
                if (node instanceof Region r) r.setMaxWidth(Double.MAX_VALUE);
                band.getChildren().add(node);
            }
        }
        return band;
    }

    // ── DashboardPanel ────────────────────────────────────────────────────────
    public Node renderPanel(JsonNode component, JsonNode metadata, JsonNode state, JsonNode data) {
        VBox panel = new VBox(8);
        panel.setPadding(new Insets(16));
        panel.setStyle(CARD_SURFACE);
        String title = metadata.path("title").asText("");
        if (!title.isBlank()) {
            Label t = new Label(title);
            t.setStyle("-fx-font-size: 1.1em; -fx-font-weight: bold;");
            panel.getChildren().add(t);
            String subtitle = metadata.path("subtitle").asText("");
            if (!subtitle.isBlank()) {
                Label s = new Label(subtitle);
                s.setStyle("-fx-font-size: 12px; -fx-text-fill: #6a6d70;");
                panel.getChildren().add(s);
            }
        }
        JsonNode children = component.path("children");
        if (children.isArray()) {
            ComponentRenderer renderer = renderer();
            for (JsonNode child : children) {
                Node content = renderer.render(child, state, data);
                VBox.setVgrow(content, Priority.ALWAYS);
                panel.getChildren().add(content);
            }
        }
        return panel;
    }

    // ── DashboardLayout ───────────────────────────────────────────────────────
    public Node renderDashboard(JsonNode component, JsonNode metadata, JsonNode state, JsonNode data) {
        int columns = metadata.path("columns").asInt(0);
        if (columns <= 0) columns = 3; // sensible default when the backend leaves it responsive

        GridPane grid = new GridPane();
        grid.setHgap(12);
        grid.setVgap(12);
        for (int i = 0; i < columns; i++) {
            ColumnConstraints cc = new ColumnConstraints();
            cc.setPercentWidth(100.0 / columns);
            cc.setHgrow(Priority.ALWAYS);
            grid.getColumnConstraints().add(cc);
        }

        JsonNode children = component.path("children");
        if (!children.isArray()) return grid;

        ComponentRenderer renderer = renderer();
        Set<Long> occupied = new HashSet<>();
        int row = 0;
        int col = 0;
        for (JsonNode child : children) {
            String childType = child.path("metadata").path("type").asText("");
            int colSpan = 1;
            int rowSpan = 1;
            if ("Scoreboard".equals(childType)) {
                colSpan = columns; // scoreboards span the full row
            } else if ("DashboardPanel".equals(childType)) {
                colSpan = Math.min(Math.max(child.path("metadata").path("colSpan").asInt(1), 1), columns);
                rowSpan = Math.max(child.path("metadata").path("rowSpan").asInt(1), 1);
            }

            // Find the next free cell where the tile fits
            while (true) {
                if (col + colSpan > columns) {
                    col = 0;
                    row++;
                    continue;
                }
                if (isFree(occupied, row, col, colSpan, rowSpan)) break;
                col++;
            }

            Node tile = renderer.render(child, state, data);
            if (tile instanceof Region r) {
                r.setMaxWidth(Double.MAX_VALUE);
                r.setMaxHeight(Double.MAX_VALUE);
            }
            GridPane.setFillWidth(tile, true);
            GridPane.setFillHeight(tile, true);
            grid.add(tile, col, row, colSpan, rowSpan);
            mark(occupied, row, col, colSpan, rowSpan);
            col += colSpan;
        }
        return grid;
    }

    private boolean isFree(Set<Long> occupied, int row, int col, int colSpan, int rowSpan) {
        for (int r = row; r < row + rowSpan; r++) {
            for (int c = col; c < col + colSpan; c++) {
                if (occupied.contains(cell(r, c))) return false;
            }
        }
        return true;
    }

    private void mark(Set<Long> occupied, int row, int col, int colSpan, int rowSpan) {
        for (int r = row; r < row + rowSpan; r++) {
            for (int c = col; c < col + colSpan; c++) {
                occupied.add(cell(r, c));
            }
        }
    }

    private long cell(int row, int col) {
        return row * 10_000L + col;
    }
}
