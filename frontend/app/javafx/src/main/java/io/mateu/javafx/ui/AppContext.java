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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Consumer;

public class AppContext {

    // Shared, app-wide services/state (one instance for the whole app).
    public final AppShell shell;
    public final MateuApiClient apiClient;
    public final String baseUrl;
    public final ObjectMapper mapper;

    public Stage primaryStage;
    public Pane contentPane;
    // The tab this context renders into (null for the chrome context). Its title tracks the view.
    public javafx.scene.control.Tab tab;

    public String currentRoute = "";
    public String currentConsumedRoute = "";
    public String currentServerSideType = "";
    public String currentComponentId = "ux_main";
    public Map<String, Object> currentComponentState = new HashMap<>();
    public Map<String, Object> appState;

    // Action ids the currently-loaded server-side component declares (for action bubbling).
    private List<String> currentComponentActions = new ArrayList<>();
    // Validation rules ({fieldId, condition, message}) the current component declares, plus which
    // of its actions require client-side validation before dispatching (e.g. create / save).
    private JsonNode currentComponentValidations = null;
    private Map<String, Boolean> currentActionValidationRequired = new HashMap<>();
    // Actions flagged bubble=true are validated/handled on the current component but executed by the
    // orchestrator (e.g. an entity form's "create"/"save" persists at the AutoCrud level).
    private Map<String, Boolean> currentActionBubble = new HashMap<>();

    // Inline field validation errors (fieldId → message), consumed by FormFieldRenderer, plus the
    // bits needed to re-render the current form in place (preserving typed values) to surface them.
    public final Map<String, String> currentFieldErrors = new HashMap<>();
    private JsonNode currentFormChildren = null;
    private StackPane currentFormContainer = null;
    // CRUD orchestrator/mediator that owns the current area: actions the inner entity forms
    // don't declare (e.g. cancel / back-to-list / new / edit) are dispatched against it.
    private String orchestratorServerSideType = "";
    private String orchestratorComponentRoute = "";

    private final Map<String, Pane> registry = new HashMap<>();
    private final Map<String, Consumer<JsonNode>> dataHandlers = new HashMap<>();

    public AppContext(AppShell shell) {
        this.shell = shell;
        this.apiClient = shell.apiClient;
        this.baseUrl = shell.baseUrl;
        this.mapper = shell.mapper;
        this.appState = shell.appState;
        this.primaryStage = shell.primaryStage;
    }

    public void registerComponent(String id, Pane pane) {
        if (id != null && !id.isBlank()) {
            registry.put(id, pane);
        }
    }

    public void registerDataHandler(String id, Consumer<JsonNode> handler) {
        if (id != null && !id.isBlank()) {
            dataHandlers.put(id, handler);
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
                    return apiClient.navigate(route, consumedRoute, serverSideType, appState);
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

    /**
     * Records the actions a freshly-loaded server-side component declares, and — when the
     * component is a CRUD orchestrator/mediator (its {@code initialData} carries
     * {@code componentRoute}) — remembers it as the bubbling target for its inner entity forms.
     */
    public void captureComponentContext(JsonNode sscNode, String serverSideType) {
        List<String> actions = new ArrayList<>();
        Map<String, Boolean> validationFlags = new HashMap<>();
        Map<String, Boolean> bubbleFlags = new HashMap<>();
        JsonNode actionNodes = sscNode.path("actions");
        if (actionNodes.isArray()) {
            for (JsonNode a : actionNodes) {
                String id = a.path("id").asText("");
                if (!id.isBlank()) {
                    actions.add(id);
                    validationFlags.put(id, a.path("validationRequired").asBoolean(false));
                    bubbleFlags.put(id, a.path("bubble").asBoolean(false));
                }
            }
        }
        currentComponentActions = actions;
        currentActionValidationRequired = validationFlags;
        currentActionBubble = bubbleFlags;
        currentComponentValidations = sscNode.path("validations");

        JsonNode initialData = sscNode.path("initialData");
        String componentRoute = initialData.path("componentRoute")
                .asText(initialData.path("_componentRoute").asText(""));
        if (!componentRoute.isBlank() && !serverSideType.isBlank()) {
            orchestratorServerSideType = serverSideType;
            orchestratorComponentRoute = componentRoute;
        }
    }

    private boolean ownsAction(String actionId) {
        if (actionId == null) return false;
        for (String owned : currentComponentActions) {
            if (owned.equals(actionId)) return true;
            if (owned.endsWith("*") && actionId.startsWith(owned.substring(0, owned.length() - 1))) {
                return true;
            }
        }
        return false;
    }

    private String resolveActionTarget(String actionId) {
        // Bubble to the orchestrator when the current component doesn't declare the action, or when
        // it declares it with bubble=true (validated here, executed there — e.g. create/save).
        boolean bubble = !ownsAction(actionId) || currentActionBubble.getOrDefault(actionId, false);
        if (bubble
                && !orchestratorServerSideType.isBlank()
                && !orchestratorServerSideType.equals(currentServerSideType)
                && currentRoute != null && currentRoute.startsWith(orchestratorComponentRoute)) {
            return orchestratorServerSideType;
        }
        return currentServerSideType;
    }

    /** Evaluates the current component's validation conditions; returns failed {fieldId → message}. */
    private Map<String, String> collectFieldErrors() {
        Map<String, String> errors = new HashMap<>();
        if (currentComponentValidations == null || !currentComponentValidations.isArray()) return errors;
        for (JsonNode v : currentComponentValidations) {
            String condition = v.path("condition").asText("");
            if (!condition.isBlank() && !evalCondition(condition, currentComponentState)) {
                String fieldId = v.path("fieldId").asText("");
                String message = v.path("message").asText("Invalid value");
                // Keep the first failure per field (matches how a field shows a single error).
                errors.putIfAbsent(fieldId, message);
            }
        }
        return errors;
    }

    /** Re-renders the current form in place from the live state so typed values are preserved and
     *  {@link #currentFieldErrors} surface as inline messages under each affected field. */
    private void rerenderCurrentForm() {
        if (currentFormContainer == null || currentFormChildren == null) return;
        JsonNode liveState = mapper.valueToTree(currentComponentState);
        Platform.runLater(() -> {
            ComponentRenderer renderer = new ComponentRenderer(this);
            List<Node> nodes = new ArrayList<>();
            for (JsonNode child : currentFormChildren) {
                nodes.add(renderer.render(child, liveState, liveState));
            }
            currentFormContainer.getChildren().setAll(nodes);
        });
    }

    // Minimal evaluator for the validation conditions Mateu emits, e.g. {@code state['x']} (truthy)
    // or {@code state['x'] >= 1} (numeric comparison). Unknown shapes are treated as satisfied so
    // they never block a save spuriously.
    private static final java.util.regex.Pattern COMPARISON = java.util.regex.Pattern.compile(
            "state\\['([^']+)'\\]\\s*(>=|<=|==|!=|>|<)\\s*(-?\\d+(?:\\.\\d+)?)");
    private static final java.util.regex.Pattern TRUTHY = java.util.regex.Pattern.compile(
            "state\\['([^']+)'\\]");

    private boolean evalCondition(String condition, Map<String, Object> state) {
        String cond = condition.trim();
        java.util.regex.Matcher c = COMPARISON.matcher(cond);
        if (c.matches()) {
            double left = toDouble(state.get(c.group(1)));
            double right = Double.parseDouble(c.group(3));
            return switch (c.group(2)) {
                case ">=" -> left >= right;
                case "<=" -> left <= right;
                case ">" -> left > right;
                case "<" -> left < right;
                case "==" -> left == right;
                case "!=" -> left != right;
                default -> true;
            };
        }
        java.util.regex.Matcher t = TRUTHY.matcher(cond);
        if (t.matches()) {
            return truthy(state.get(t.group(1)));
        }
        return true;
    }

    private boolean truthy(Object v) {
        if (v == null) return false;
        if (v instanceof JsonNode jn) {
            if (jn.isNull() || jn.isMissingNode()) return false;
            if (jn.isTextual()) return !jn.asText().isBlank();
            if (jn.isNumber()) return jn.asDouble() != 0;
            if (jn.isBoolean()) return jn.asBoolean();
            return !jn.isEmpty();
        }
        if (v instanceof String s) return !s.isBlank();
        if (v instanceof Number n) return n.doubleValue() != 0;
        if (v instanceof Boolean b) return b;
        return true;
    }

    private double toDouble(Object v) {
        try {
            if (v instanceof JsonNode jn) return jn.isNumber() ? jn.asDouble()
                    : (jn.isTextual() ? Double.parseDouble(jn.asText()) : 0);
            if (v instanceof Number n) return n.doubleValue();
            if (v instanceof String s) return Double.parseDouble(s);
        } catch (NumberFormatException ignored) { }
        return 0;
    }


    public void runAction(String actionId, Map<String, Object> parameters) {
        if (contentPane == null) return;

        // Client-side validation: actions flagged validationRequired (e.g. create/save) only fire
        // if every validation condition holds against the current state — mirrors the web frontend,
        // which blocks the request and surfaces inline field errors instead of round-tripping.
        if (currentActionValidationRequired.getOrDefault(actionId, false)) {
            Map<String, String> fieldErrors = collectFieldErrors();
            currentFieldErrors.clear();
            if (!fieldErrors.isEmpty()) {
                currentFieldErrors.putAll(fieldErrors);
                rerenderCurrentForm();
                return;
            }
        }

        // Action bubbling: if the current component doesn't declare this action and we're inside
        // a CRUD orchestrator, dispatch against the orchestrator's serverSideType (mirrors the
        // web frontend, where unhandled action-requested events bubble up to the mediator).
        final String serverSideType = resolveActionTarget(actionId);

        Task<JsonNode> task = new Task<>() {
            @Override
            protected JsonNode call() throws Exception {
                return apiClient.runAction(
                        currentRoute, currentConsumedRoute, actionId,
                        serverSideType, currentComponentId,
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

        Pane target = targetId.isBlank() ? contentPane : registry.getOrDefault(targetId, contentPane);

        if (component.isNull() || component.isMissingNode()) {
            // Data-only fragment — push to a registered data handler (e.g. Crud search results)
            if (!data.isNull() && !data.isMissingNode()) {
                String key = targetId.isBlank() ? "ux_main" : targetId;
                Consumer<JsonNode> handler = dataHandlers.get(key);
                if (handler != null) {
                    Platform.runLater(() -> handler.accept(data));
                }
                return;
            }

            // State-only navigation fragment from a CRUD orchestrator/mediator action
            // (e.g. view/new/save): instead of returning a component, the backend updated the
            // component's sub-route (_route) under its base route (_componentRoute). Follow up
            // by loading the resolved full route so the detail/form renders. On the web this is
            // driven by PushStateToHistory → route change; in JavaFX we navigate explicitly.
            if (state.isObject() && state.has("_route") && state.has("_componentRoute")) {
                String compRoute = state.path("_componentRoute").asText("");
                String fullRoute = compRoute + state.path("_route").asText("");
                // These _route fragments are produced by the CRUD orchestrator, so the follow-up
                // load must target the orchestrator's serverSideType — not whatever entity form
                // (e.g. Reservation) happens to be current after descending into a detail/new view.
                String sst = (!orchestratorServerSideType.isBlank()
                        && orchestratorComponentRoute.equals(compRoute))
                        ? orchestratorServerSideType : currentServerSideType;
                Platform.runLater(() -> navigate(fullRoute, compRoute, sst, ""));
            }
            return;
        }

        if (target == null) return;

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
                // Skip empty and the orchestrator's internal "[State[…], UICommand[…]]" payloads.
                if (title.isBlank() || title.startsWith("[")) break;
                if (tab != null) {
                    String shortTitle = title.length() > 28 ? title.substring(0, 27) + "…" : title;
                    Platform.runLater(() -> {
                        tab.setText(shortTitle);
                        tab.setTooltip(new javafx.scene.control.Tooltip(title));
                    });
                } else if (primaryStage != null) {
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

        captureComponentContext(sscNode, serverSideType);

        JsonNode children = sscNode.path("children");
        if (children.isArray() && !children.isEmpty()) {
            // Children are already populated inline — use them directly.
            JsonNode firstChild = children.get(0);
            boolean firstChildIsApp = "ClientSide".equals(firstChild.path("type").asText(""))
                    && "App".equals(firstChild.path("metadata").path("type").asText(""));

            if (firstChildIsApp) {
                // App (MEDIATOR or shell) inside the SSC: delegate content loading to navigate
                // so content lands in the existing contentPane rather than creating nested panes.
                if (!id.isBlank()) currentComponentId = id;
                if (!serverSideType.isBlank()) currentServerSideType = serverSideType;
                JsonNode meta = firstChild.path("metadata");
                String homeRoute = meta.path("homeRoute").asText("");
                String homeConsumedRoute = meta.path("homeConsumedRoute").asText("");
                String homeSST = meta.path("homeServerSideType").asText(
                        meta.path("serverSideType").asText(""));
                if (!homeRoute.isBlank() || !homeSST.isBlank()) {
                    navigate(homeRoute, homeConsumedRoute, homeSST, "");
                }
            } else {
                // Non-App inline children (Page, Form, etc.) — render them directly
                if (!id.isBlank()) currentComponentId = id;
                if (!serverSideType.isBlank()) currentServerSideType = serverSideType;

                // Seed component state from SSC initial data so OnLoad triggers have defaults
                JsonNode initialData = sscNode.path("initialData");
                if (initialData.isObject()) {
                    currentComponentState = new HashMap<>();
                    initialData.fields().forEachRemaining(entry ->
                            currentComponentState.put(entry.getKey(), entry.getValue()));
                }

                JsonNode state = sscNode.path("initialData");
                JsonNode triggers = sscNode.path("triggers");
                // Remember what to re-render (in place) if client-side validation fails later, and
                // clear any field errors carried over from a previous form.
                currentFormChildren = children;
                currentFormContainer = container;
                currentFieldErrors.clear();
                Platform.runLater(() -> {
                    ComponentRenderer renderer = new ComponentRenderer(this);
                    java.util.List<Node> nodes = new java.util.ArrayList<>();
                    for (JsonNode child : children) {
                        nodes.add(renderer.render(child, state, state));
                    }
                    container.getChildren().setAll(nodes);

                    // Fire OnLoad triggers (e.g. Crud "search" to populate data)
                    if (triggers.isArray()) {
                        for (JsonNode trigger : triggers) {
                            if ("OnLoad".equalsIgnoreCase(trigger.path("type").asText(""))) {
                                String triggerActionId = trigger.path("actionId").asText("");
                                if (!triggerActionId.isBlank()) {
                                    if ("search".equals(triggerActionId)) {
                                        // Backend requires these pagination fields; seed defaults if absent
                                        currentComponentState.putIfAbsent("page", 0);
                                        currentComponentState.putIfAbsent("size", 10);
                                        currentComponentState.putIfAbsent("sort", java.util.List.of());
                                        currentComponentState.putIfAbsent("searchText", "");
                                    }
                                    runAction(triggerActionId, null);
                                }
                            }
                        }
                    }
                });
            }
            return container;
        }

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
