package io.mateu.javafx.ui.renderer;

import com.fasterxml.jackson.databind.JsonNode;
import io.mateu.javafx.ui.AppContext;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Node;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.Tooltip;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Pane;
import javafx.scene.layout.Priority;
import javafx.scene.layout.Region;
import javafx.scene.layout.StackPane;
import javafx.scene.layout.VBox;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * Renders the display-oriented component types added for renderer parity with the web UX
 * patterns: {@code HeroSection} headers, {@code EmptyState} placeholders, {@code Skeleton}
 * loading blocks and the {@code Gantt} timeline — mirroring {@code heroRenderer.ts},
 * {@code emptyStateRenderer.ts}, {@code mateu-skeleton.ts} and {@code mateu-gantt.ts}.
 */
public class DisplayRenderer {

    private static final String BONE = "-fx-background-color: #e5e5e5; -fx-background-radius: 6;";

    private final AppContext ctx;

    public DisplayRenderer(AppContext ctx) {
        this.ctx = ctx;
    }

    // ── HeroSection ───────────────────────────────────────────────────────────
    public Node renderHero(JsonNode component, JsonNode metadata, JsonNode state, JsonNode data) {
        boolean centered = metadata.path("centered").asBoolean(true);
        String image = metadata.path("image").asText("");
        boolean withImage = !image.isBlank();

        VBox content = new VBox(12);
        content.setAlignment(centered ? Pos.CENTER : Pos.CENTER_LEFT);
        content.setPadding(new Insets(40, 24, 40, 24));

        String title = metadata.path("title").asText("");
        if (!title.isBlank()) {
            Label t = new Label(title);
            t.setWrapText(true);
            t.setStyle("-fx-font-size: 28px; -fx-font-weight: bold;"
                    + (withImage ? " -fx-text-fill: white;" : ""));
            content.getChildren().add(t);
        }
        String subtitle = metadata.path("subtitle").asText("");
        if (!subtitle.isBlank()) {
            Label s = new Label(subtitle);
            s.setWrapText(true);
            s.setStyle("-fx-font-size: 15px;"
                    + (withImage ? " -fx-text-fill: white;" : " -fx-text-fill: #6a6d70;"));
            content.getChildren().add(s);
        }

        // Slotted children (CTA buttons etc.) in a row below the text
        JsonNode children = component.path("children");
        if (children.isArray() && !children.isEmpty()) {
            HBox ctas = new HBox(8);
            ctas.setAlignment(centered ? Pos.CENTER : Pos.CENTER_LEFT);
            ComponentRenderer renderer = new ComponentRenderer(ctx);
            for (JsonNode child : children) {
                ctas.getChildren().add(renderer.render(child, state, data));
            }
            content.getChildren().add(ctas);
        }

        StackPane hero = new StackPane();
        hero.setMinHeight(parseHeight(metadata.path("height").asText(""), 192));
        if (withImage) {
            // Background image with a dark overlay so the white text stays readable
            hero.setStyle("-fx-background-image: url('" + image + "'); -fx-background-size: cover; "
                    + "-fx-background-position: center; -fx-background-radius: 12;");
            Region overlay = new Region();
            overlay.setStyle("-fx-background-color: rgba(0,0,0,0.35); -fx-background-radius: 12;");
            hero.getChildren().add(overlay);
        } else {
            hero.setStyle("-fx-background-color: #f0f4f8; -fx-background-radius: 12;");
        }
        hero.getChildren().add(content);
        return hero;
    }

    /** Parses CSS-ish heights ("12rem", "200px", "200") to pixels; falls back on anything else. */
    private double parseHeight(String height, double fallback) {
        String h = height.trim();
        if (h.isEmpty()) return fallback;
        try {
            if (h.endsWith("rem")) return Double.parseDouble(h.substring(0, h.length() - 3).trim()) * 16;
            if (h.endsWith("em")) return Double.parseDouble(h.substring(0, h.length() - 2).trim()) * 16;
            if (h.endsWith("px")) return Double.parseDouble(h.substring(0, h.length() - 2).trim());
            return Double.parseDouble(h);
        } catch (NumberFormatException e) {
            return fallback;
        }
    }

    // ── EmptyState ────────────────────────────────────────────────────────────
    public Node renderEmptyState(JsonNode metadata) {
        VBox box = new VBox(6);
        box.setAlignment(Pos.CENTER);
        box.setPadding(new Insets(24));

        Label icon = new Label(metadata.path("icon").asText("🗂"));
        icon.setStyle("-fx-font-size: 26px; -fx-opacity: 0.6;");
        box.getChildren().add(icon);

        String title = metadata.path("title").asText("");
        if (!title.isBlank()) {
            Label t = new Label(title);
            t.setStyle("-fx-font-weight: bold;");
            box.getChildren().add(t);
        }
        Label description = new Label(metadata.path("description").asText("Nothing here yet."));
        description.setWrapText(true);
        description.setStyle("-fx-font-size: 12px; -fx-text-fill: #6a6d70;");
        box.getChildren().add(description);

        String actionId = metadata.path("actionId").asText("");
        String actionLabel = metadata.path("actionLabel").asText("");
        if (!actionId.isBlank() && !actionLabel.isBlank()) {
            Button cta = new Button(actionLabel);
            cta.getStyleClass().add("btn-link");
            cta.setOnAction(e -> ctx.runAction(actionId, null));
            box.getChildren().add(cta);
        }
        return box;
    }

    // ── Skeleton ──────────────────────────────────────────────────────────────
    public Node renderSkeleton(JsonNode metadata) {
        String variant = metadata.path("variant").asText("text");
        int count = Math.max(1, metadata.path("count").asInt(3));

        VBox box = new VBox(8);
        box.setPadding(new Insets(4, 0, 4, 0));
        for (int i = 0; i < count; i++) {
            switch (variant) {
                case "card" -> box.getChildren().add(bone(box, 120, 1));
                case "grid" -> box.getChildren().add(bone(box, 30, 1));
                case "form" -> {
                    VBox pair = new VBox(4);
                    pair.getChildren().addAll(bone(box, 10, 0.3), bone(box, 30, 1));
                    box.getChildren().add(pair);
                }
                default -> { // text: lines of varying width
                    double width = switch (i % 3) {
                        case 0 -> 0.95;
                        case 1 -> 0.6;
                        default -> 0.8;
                    };
                    box.getChildren().add(bone(box, 14, width));
                }
            }
        }
        return box;
    }

    /** A static grey placeholder block sized relative to its container (no shimmer on desktop). */
    private Region bone(Region container, double height, double widthFraction) {
        Region bone = new Region();
        bone.setPrefHeight(height);
        bone.setMinHeight(height);
        bone.setStyle(BONE);
        if (widthFraction < 1) {
            bone.maxWidthProperty().bind(container.widthProperty().multiply(widthFraction));
        }
        return bone;
    }

    // ── Gantt ─────────────────────────────────────────────────────────────────
    private record GanttTask(String title, LocalDate start, LocalDate end, double progress, String color) {}

    public Node renderGantt(JsonNode metadata) {
        List<GanttTask> tasks = new ArrayList<>();
        JsonNode taskNodes = metadata.path("tasks");
        if (taskNodes.isArray()) {
            for (JsonNode t : taskNodes) {
                try {
                    tasks.add(new GanttTask(
                            t.path("title").asText(""),
                            LocalDate.parse(t.path("start").asText("")),
                            LocalDate.parse(t.path("end").asText("")),
                            t.path("progress").asDouble(0),
                            t.path("color").asText("")));
                } catch (Exception ignored) {
                    // Skip tasks with unparseable dates
                }
            }
        }
        if (tasks.isEmpty()) return new VBox();

        // Global range with one day of padding on each side (matches mateu-gantt.ts)
        long minDay = tasks.stream().mapToLong(t -> Math.min(t.start().toEpochDay(), t.end().toEpochDay())).min().orElse(0) - 1;
        long maxDay = tasks.stream().mapToLong(t -> Math.max(t.start().toEpochDay(), t.end().toEpochDay())).max().orElse(0) + 2;
        double span = maxDay - minDay;

        final double labelWidth = 160;
        VBox frame = new VBox();
        frame.setStyle("-fx-background-color: white; -fx-border-color: #d2d2d2; -fx-border-radius: 8; -fx-background-radius: 8;");

        // Header row: "Task" + month headers sized proportionally to the days they cover
        HBox header = new HBox();
        Label taskHead = new Label("Task");
        taskHead.setPrefWidth(labelWidth);
        taskHead.setMinWidth(labelWidth);
        taskHead.setPadding(new Insets(7, 12, 7, 12));
        taskHead.setStyle("-fx-font-weight: bold; -fx-text-fill: #6a6d70;");
        HBox months = new HBox();
        HBox.setHgrow(months, Priority.ALWAYS);
        LocalDate cursor = LocalDate.ofEpochDay(minDay).withDayOfMonth(1);
        DateTimeFormatter monthFormat = DateTimeFormatter.ofPattern("MMM yy");
        while (cursor.toEpochDay() <= maxDay) {
            long from = Math.max(cursor.toEpochDay(), minDay);
            long to = Math.min(cursor.plusMonths(1).toEpochDay(), maxDay);
            Label month = new Label(monthFormat.format(cursor));
            month.setPadding(new Insets(7, 0, 7, 8));
            month.setStyle("-fx-text-fill: #6a6d70; -fx-border-color: transparent transparent transparent #ececec;");
            month.prefWidthProperty().bind(months.widthProperty().multiply((to - from) / span));
            month.setMinWidth(0);
            cursor = cursor.plusMonths(1);
            months.getChildren().add(month);
        }
        header.getChildren().addAll(taskHead, months);
        header.setStyle("-fx-background-color: #f7f7f7; -fx-background-radius: 8 8 0 0; "
                + "-fx-border-color: transparent transparent #ececec transparent;");
        frame.getChildren().add(header);

        long today = LocalDate.now().toEpochDay();
        for (GanttTask task : tasks) {
            HBox row = new HBox();
            row.setStyle("-fx-border-color: transparent transparent #ececec transparent;");
            Label label = new Label(task.title());
            label.setPrefWidth(labelWidth);
            label.setMinWidth(labelWidth);
            label.setPadding(new Insets(7, 12, 7, 12));
            label.setTooltip(new Tooltip(task.title()));

            Pane lane = new Pane();
            lane.setPrefHeight(30);
            lane.setMinHeight(30);
            HBox.setHgrow(lane, Priority.ALWAYS);

            // Vertical "today" marker
            if (today >= minDay && today <= maxDay) {
                Region marker = new Region();
                marker.setPrefWidth(2);
                marker.setStyle("-fx-background-color: #e11d48; -fx-opacity: 0.55;");
                marker.layoutXProperty().bind(lane.widthProperty().multiply((today - minDay) / span));
                marker.prefHeightProperty().bind(lane.heightProperty());
                lane.getChildren().add(marker);
            }

            // Task bar positioned proportionally between the global min/max dates (end inclusive)
            double startFrac = (task.start().toEpochDay() - minDay) / span;
            double widthFrac = (task.end().toEpochDay() + 1 - task.start().toEpochDay()) / span;
            Pane bar = new Pane();
            bar.setStyle("-fx-background-color: #cbd5e1; -fx-background-radius: 8;");
            bar.layoutXProperty().bind(lane.widthProperty().multiply(startFrac));
            bar.prefWidthProperty().bind(lane.widthProperty().multiply(widthFrac));
            bar.setPrefHeight(16);
            bar.setMinHeight(16);
            bar.layoutYProperty().bind(lane.heightProperty().subtract(16).divide(2));

            // Progress fill inside the bar
            String fillColor = task.color().isBlank() ? "#1a73e8" : task.color();
            Region fill = new Region();
            fill.setStyle("-fx-background-color: " + fillColor + "; -fx-background-radius: 8 0 0 8;");
            fill.prefWidthProperty().bind(bar.widthProperty().multiply(Math.max(0, Math.min(100, task.progress())) / 100));
            fill.prefHeightProperty().bind(bar.heightProperty());
            bar.getChildren().add(fill);

            Tooltip.install(bar, new Tooltip(task.title() + " · " + task.start() + " → " + task.end()
                    + (task.progress() > 0 ? " · " + Math.round(task.progress()) + "%" : "")));

            lane.getChildren().add(bar);
            row.getChildren().addAll(label, lane);
            frame.getChildren().add(row);
        }
        return frame;
    }
}
