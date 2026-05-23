package io.mateu.javafx.ui;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.javafx.api.MateuApiClient;
import io.mateu.javafx.ui.renderer.ComponentRenderer;
import javafx.application.Platform;
import javafx.concurrent.Task;
import javafx.scene.Node;
import javafx.scene.control.Alert;
import javafx.scene.control.ProgressIndicator;
import javafx.scene.layout.Pane;
import javafx.scene.layout.StackPane;
import javafx.stage.Stage;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class AppContext {

    public final MateuApiClient apiClient;
    public final String baseUrl;
    public final ObjectMapper mapper = new ObjectMapper();

    public Stage primaryStage;
    public Pane contentPane;

    public String currentRoute = "";
    public String currentConsumedRoute = "";
    public String currentServerSideType = "";
    public String currentComponentId = "ux_main";
    public Map<String, Object> currentComponentState = new HashMap<>();
    public Map<String, Object> appState = new HashMap<>();

    private final Map<String, Pane> registry = new HashMap<>();

    public AppContext(String baseUrl) {
        this.baseUrl = baseUrl;
        this.apiClient = new MateuApiClient(baseUrl, UUID.randomUUID().toString());
    }

    public void registerComponent(String id, Pane pane) {
        if (id != null && !id.isBlank()) {
            registry.put(id, pane);
        }
    }

    public void navigate(String route, String consumedRoute, String serverSideType, String actionId) {
        if (contentPane == null) return;

        ProgressIndicator progress = new ProgressIndicator();
        progress.getStyleClass().add("loading-indicator");
        contentPane.getChildren().setAll(progress);

        Task<JsonNode> task = new Task<>() {
            @Override
            protected JsonNode call() throws Exception {
                if (actionId != null && !actionId.isBlank()) {
                    return apiClient.runAction(route, consumedRoute != null ? consumedRoute : "",
                            actionId, serverSideType, currentComponentId,
                            currentComponentState, appState, Map.of());
                } else {
                    return apiClient.navigate(route, consumedRoute, serverSideType);
                }
            }
        };

        task.setOnSucceeded(e -> {
            currentRoute = route != null ? route : "";
            currentConsumedRoute = consumedRoute != null ? consumedRoute : "";
            currentServerSideType = serverSideType != null ? serverSideType : "";
            currentComponentState = new HashMap<>();
            applyIncrement(task.getValue());
        });

        task.setOnFailed(e -> {
            Platform.runLater(() -> showError("Navigation failed: " + task.getException().getMessage()));
        });

        new Thread(task, "mateu-navigate").start();
    }

    public void runAction(String actionId, Map<String, Object> parameters) {
        if (contentPane == null) return;

        Task<JsonNode> task = new Task<>() {
            @Override
            protected JsonNode call() throws Exception {
                return apiClient.runAction(
                        currentRoute, currentConsumedRoute, actionId,
                        currentServerSideType, currentComponentId,
                        currentComponentState, appState,
                        parameters != null ? parameters : Map.of());
            }
        };

        task.setOnSucceeded(e -> {
            currentComponentState = new HashMap<>();
            applyIncrement(task.getValue());
        });

        task.setOnFailed(e -> {
            Platform.runLater(() -> showError("Action failed: " + task.getException().getMessage()));
        });

        new Thread(task, "mateu-action").start();
    }

    public void applyIncrement(JsonNode increment) {
        if (increment == null) return;

        JsonNode fragments = increment.path("fragments");
        if (fragments.isArray()) {
            for (JsonNode fragment : fragments) {
                applyFragment(fragment);
            }
        }

        JsonNode messages = increment.path("messages");
        if (messages.isArray()) {
            for (JsonNode msg : messages) {
                String text = msg.path("text").asText("");
                String variant = msg.path("variant").asText("info");
                if (!text.isBlank()) {
                    Platform.runLater(() -> showMessage(text, variant));
                }
            }
        }

        JsonNode commands = increment.path("commands");
        if (commands.isArray()) {
            for (JsonNode cmd : commands) {
                handleCommand(cmd);
            }
        }

        JsonNode newAppState = increment.path("appState");
        if (!newAppState.isNull() && newAppState.isObject()) {
            newAppState.fields().forEachRemaining(entry ->
                    appState.put(entry.getKey(), entry.getValue()));
        }
    }

    private void applyFragment(JsonNode fragment) {
        String targetId = fragment.path("targetComponentId").asText("");
        String action = fragment.path("action").asText("Replace");
        JsonNode component = fragment.path("component");
        JsonNode state = fragment.path("state");
        JsonNode data = fragment.path("data");

        // Check if there is a _route in state (navigation hint from server)
        if (!state.isNull() && state.isObject()) {
            JsonNode routeNode = state.path("_route");
            if (!routeNode.isMissingNode() && !routeNode.isNull()) {
                String newRoute = routeNode.asText("");
                String componentRoute = state.path("_componentRoute").asText(currentConsumedRoute);
                Platform.runLater(() -> navigate(componentRoute + newRoute, componentRoute,
                        currentServerSideType, ""));
                return;
            }
        }

        Pane target = targetId.isBlank() ? contentPane : registry.getOrDefault(targetId, contentPane);

        if (target == null || component.isNull() || component.isMissingNode()) return;

        Platform.runLater(() -> {
            ComponentRenderer renderer = new ComponentRenderer(this);
            Node rendered = renderer.render(component, state, data);
            if ("Add".equalsIgnoreCase(action)) {
                target.getChildren().add(rendered);
            } else {
                target.getChildren().setAll(rendered);
            }
        });
    }

    private void handleCommand(JsonNode cmd) {
        String type = cmd.path("type").asText("");
        JsonNode cmdData = cmd.path("data");

        switch (type) {
            case "SetWindowTitle" -> {
                String title = cmdData.isTextual() ? cmdData.asText() : cmdData.path("title").asText("");
                if (!title.isBlank() && primaryStage != null) {
                    Platform.runLater(() -> primaryStage.setTitle(title));
                }
            }
            case "NavigateTo" -> {
                String href = cmdData.isTextual() ? cmdData.asText() : cmdData.path("href").asText("");
                if (!href.isBlank()) {
                    Platform.runLater(() -> navigate(href, "", null, ""));
                }
            }
            case "PushStateToHistory" -> {
                // No browser history in desktop; just update window title with route
            }
            case "CloseModal" -> Platform.runLater(this::closeCurrentDialog);
            default -> { /* ignore unknown commands */ }
        }
    }

    private javafx.stage.Stage currentDialog;

    public void openDialog(javafx.stage.Stage dialog) {
        this.currentDialog = dialog;
    }

    public void closeCurrentDialog() {
        if (currentDialog != null) {
            currentDialog.close();
            currentDialog = null;
        }
    }

    public StackPane loadServerSideComponent(JsonNode sscNode) {
        StackPane container = new StackPane();
        String id = sscNode.path("id").asText("");
        registerComponent(id, container);

        String route = sscNode.path("route").asText("");
        String serverSideType = sscNode.path("serverSideType").asText("");

        ProgressIndicator progress = new ProgressIndicator();
        container.getChildren().add(progress);

        String prevRoute = currentRoute;
        String prevConsumedRoute = currentConsumedRoute;
        String prevSst = currentServerSideType;
        String prevId = currentComponentId;

        currentRoute = route;
        currentServerSideType = serverSideType;
        currentComponentId = id.isBlank() ? currentComponentId : id;

        Task<JsonNode> task = new Task<>() {
            @Override
            protected JsonNode call() throws Exception {
                return apiClient.runAction(route, currentConsumedRoute, "",
                        serverSideType, id.isBlank() ? "ux_main" : id,
                        Map.of(), appState, Map.of());
            }
        };

        task.setOnSucceeded(e -> {
            JsonNode increment = task.getValue();
            JsonNode fragments = increment.path("fragments");
            if (fragments.isArray() && !fragments.isEmpty()) {
                JsonNode frag = fragments.get(0);
                JsonNode component = frag.path("component");
                JsonNode state = frag.path("state");
                JsonNode data = frag.path("data");
                Platform.runLater(() -> {
                    ComponentRenderer renderer = new ComponentRenderer(AppContext.this);
                    Node rendered = renderer.render(component, state, data);
                    container.getChildren().setAll(rendered);
                });
            }

            JsonNode messages = increment.path("messages");
            if (messages.isArray()) {
                for (JsonNode msg : messages) {
                    String text = msg.path("text").asText("");
                    String variant = msg.path("variant").asText("info");
                    if (!text.isBlank()) Platform.runLater(() -> showMessage(text, variant));
                }
            }
        });

        task.setOnFailed(e -> {
            currentRoute = prevRoute;
            currentConsumedRoute = prevConsumedRoute;
            currentServerSideType = prevSst;
            currentComponentId = prevId;
            Platform.runLater(() -> container.getChildren().setAll(
                    new javafx.scene.control.Label("Load failed: " + task.getException().getMessage())));
        });

        new Thread(task, "mateu-ssc-load").start();
        return container;
    }

    private void showMessage(String text, String variant) {
        Alert.AlertType alertType = switch (variant) {
            case "error" -> Alert.AlertType.ERROR;
            case "warning" -> Alert.AlertType.WARNING;
            case "success" -> Alert.AlertType.INFORMATION;
            default -> Alert.AlertType.INFORMATION;
        };
        Alert alert = new Alert(alertType, text);
        alert.setHeaderText(null);
        alert.showAndWait();
    }

    private void showError(String message) {
        Alert alert = new Alert(Alert.AlertType.ERROR, message);
        alert.setHeaderText("Error");
        alert.showAndWait();
    }
}
