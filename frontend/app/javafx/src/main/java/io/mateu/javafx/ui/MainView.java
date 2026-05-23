package io.mateu.javafx.ui;

import com.fasterxml.jackson.databind.JsonNode;
import io.mateu.javafx.ui.renderer.ComponentRenderer;
import javafx.application.Platform;
import javafx.concurrent.Task;
import javafx.scene.Node;
import javafx.scene.control.Alert;
import javafx.scene.control.ProgressIndicator;
import javafx.scene.layout.*;

public class MainView {

    private final AppContext ctx;
    private final StackPane root;
    private final String initialRoute;

    public MainView(String baseUrl, String initialRoute) {
        this.ctx = new AppContext(baseUrl);
        this.initialRoute = initialRoute;

        root = new StackPane();
        root.getStyleClass().add("root");

        ProgressIndicator progress = new ProgressIndicator();
        root.getChildren().add(progress);
    }

    public StackPane getRoot() {
        return root;
    }

    public AppContext getCtx() {
        return ctx;
    }

    public void load() {
        Task<JsonNode> task = new Task<>() {
            @Override
            protected JsonNode call() throws Exception {
                return ctx.apiClient.initialLoad(initialRoute);
            }
        };

        task.setOnSucceeded(e -> {
            JsonNode increment = task.getValue();
            processInitialIncrement(increment);
        });

        task.setOnFailed(e -> {
            Platform.runLater(() -> {
                Alert alert = new Alert(Alert.AlertType.ERROR,
                        "Failed to connect to Mateu backend at " + ctx.baseUrl
                                + "\n\n" + task.getException().getMessage());
                alert.setHeaderText("Connection Error");
                alert.showAndWait();
            });
        });

        new Thread(task, "mateu-initial-load").start();
    }

    private void processInitialIncrement(JsonNode increment) {
        if (increment == null) return;

        JsonNode fragments = increment.path("fragments");
        if (!fragments.isArray() || fragments.isEmpty()) return;

        // Find the App fragment (first fragment with App metadata)
        JsonNode appFragment = null;
        for (JsonNode fragment : fragments) {
            JsonNode component = fragment.path("component");
            JsonNode metadata = component.path("metadata");
            if ("App".equals(metadata.path("type").asText(""))) {
                appFragment = fragment;
                break;
            }
        }

        // Fall back to first fragment if no App found
        if (appFragment == null) appFragment = fragments.get(0);

        final JsonNode finalFragment = appFragment;
        Platform.runLater(() -> {
            JsonNode component = finalFragment.path("component");
            JsonNode state = finalFragment.path("state");
            JsonNode data = finalFragment.path("data");

            ComponentRenderer renderer = new ComponentRenderer(ctx);
            Node rendered = renderer.render(component, state, data);
            root.getChildren().setAll(rendered);
        });

        // Handle messages from initial load
        JsonNode messages = increment.path("messages");
        if (messages.isArray()) {
            for (JsonNode msg : messages) {
                String text = msg.path("text").asText("");
                String variant = msg.path("variant").asText("info");
                if (!text.isBlank()) {
                    Platform.runLater(() -> {
                        Alert.AlertType type = "error".equals(variant)
                                ? Alert.AlertType.ERROR : Alert.AlertType.INFORMATION;
                        new Alert(type, text).show();
                    });
                }
            }
        }
    }
}
