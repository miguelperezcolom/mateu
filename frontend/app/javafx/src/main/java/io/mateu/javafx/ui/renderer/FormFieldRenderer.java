package io.mateu.javafx.ui.renderer;

import com.fasterxml.jackson.databind.JsonNode;
import io.mateu.javafx.ui.AppContext;
import javafx.scene.Node;
import javafx.scene.control.*;
import javafx.scene.image.ImageView;
import javafx.scene.layout.HBox;
import javafx.scene.layout.StackPane;
import javafx.scene.layout.VBox;

import java.util.Map;

public class FormFieldRenderer {

    private final AppContext ctx;

    public FormFieldRenderer(AppContext ctx) {
        this.ctx = ctx;
    }

    public Node render(JsonNode metadata, JsonNode state, JsonNode data) {
        String fieldId = metadata.path("fieldId").asText("");
        String label = metadata.path("label").asText(fieldId);
        String dataType = metadata.path("dataType").asText("string");
        String stereotype = metadata.path("stereotype").asText("");
        boolean required = metadata.path("required").asBoolean(false);
        boolean readOnly = metadata.path("readOnly").asBoolean(false);
        boolean disabled = metadata.path("disabled").asBoolean(false);

        JsonNode rawValue = (state != null && !state.isNull() && state.has(fieldId))
                ? state.path(fieldId) : metadata.path("initialValue");
        String value = rawValue.isNull() || rawValue.isMissingNode() ? "" : rawValue.asText("");

        VBox container = new VBox(4);
        javafx.scene.layout.HBox.setHgrow(container, javafx.scene.layout.Priority.ALWAYS);

        Label lbl = new Label(label + (required ? " *" : ""));
        lbl.getStyleClass().add("field-label");

        Node input = buildInput(fieldId, dataType, stereotype, value, rawValue, readOnly, disabled, metadata, data);
        container.getChildren().addAll(lbl, input);

        // Inline validation error (set by AppContext when a validationRequired action is blocked)
        String error = ctx.currentFieldErrors.get(fieldId);
        if (error != null && !error.isBlank()) {
            input.getStyleClass().add("field-invalid");
            Label err = new Label(error);
            err.getStyleClass().add("field-error");
            err.setWrapText(true);
            container.getChildren().add(err);
        }
        return container;
    }

    private Node buildInput(String fieldId, String dataType, String stereotype,
                             String value, JsonNode rawValue,
                             boolean readOnly, boolean disabled,
                             JsonNode metadata, JsonNode data) {

        // Boolean
        if ("bool".equals(dataType) || "boolean".equals(dataType) || "Boolean".equals(dataType)) {
            CheckBox cb = new CheckBox();
            cb.setSelected(rawValue.asBoolean(false));
            cb.setDisable(disabled || readOnly);
            cb.selectedProperty().addListener((obs, o, n) ->
                    ctx.currentComponentState.put(fieldId, n));
            return cb;
        }

        // Textarea
        if ("textarea".equals(stereotype)) {
            TextArea ta = new TextArea(value);
            ta.setEditable(!readOnly && !disabled);
            ta.setPrefRowCount(4);
            ta.setWrapText(true);
            ta.setMaxWidth(Double.MAX_VALUE);
            ta.textProperty().addListener((obs, o, n) ->
                    ctx.currentComponentState.put(fieldId, n));
            return ta;
        }

        // Date
        if ("date".equals(dataType) || "LocalDate".equals(dataType)) {
            DatePicker dp = new DatePicker();
            if (!value.isBlank()) {
                try { dp.setValue(java.time.LocalDate.parse(value)); } catch (Exception ignored) {}
            }
            dp.setDisable(disabled || readOnly);
            dp.setMaxWidth(Double.MAX_VALUE);
            dp.valueProperty().addListener((obs, o, n) ->
                    ctx.currentComponentState.put(fieldId, n != null ? n.toString() : null));
            return dp;
        }

        // Signature capture: a drawing canvas whose accepted strokes land in the value as a
        // PNG data URI — same self-contained contract as the web renderers.
        if ("signature".equals(stereotype)) {
            return buildSignaturePad(fieldId, value, readOnly || disabled);
        }

        // Photo capture: JavaFX has no camera API, so the desktop parity is a file chooser whose
        // picked image lands in the value as a data URI (the web renderers open the real camera).
        if ("camera".equals(stereotype)) {
            return buildPhotoPicker(fieldId, value, readOnly || disabled);
        }

        // Tree select: the dropdown unfolds a TREE of options (options carry children).
        if ("treeSelect".equals(stereotype)) {
            return buildTreeSelect(fieldId, metadata, value, readOnly || disabled);
        }

        // Options (enum/reference with static options)
        JsonNode options = metadata.path("options");
        if (options.isArray() && !options.isEmpty()) {
            ComboBox<String> cb = new ComboBox<>();
            for (JsonNode opt : options) {
                cb.getItems().add(opt.path("label").asText(opt.path("value").asText()));
            }
            cb.setValue(findLabelForValue(options, value));
            cb.setDisable(disabled || readOnly);
            cb.setMaxWidth(Double.MAX_VALUE);
            cb.valueProperty().addListener((obs, o, n) -> {
                String selected = findValueForLabel(options, n);
                ctx.currentComponentState.put(fieldId, selected);
            });
            return cb;
        }

        // Remote reference options from data
        if ("reference".equals(dataType)) {
            JsonNode remoteOptions = (data != null && !data.isNull())
                    ? (data.has(fieldId) ? data.path(fieldId) : data)
                    : ctx.mapper.createArrayNode();
            JsonNode contentNode = remoteOptions.has("content")
                    ? remoteOptions.path("content") : remoteOptions;

            if (contentNode.isArray() && !contentNode.isEmpty()) {
                ComboBox<String> cb = new ComboBox<>();
                for (JsonNode opt : contentNode) {
                    cb.getItems().add(opt.path("label").asText(
                            opt.path("name").asText(opt.path("value").asText())));
                }
                cb.setDisable(disabled || readOnly);
                cb.setMaxWidth(Double.MAX_VALUE);
                cb.valueProperty().addListener((obs, o, n) ->
                        ctx.currentComponentState.put(fieldId, n));
                return cb;
            }
        }

        // Array (multi-select)
        if ("array".equals(dataType)) {
            ListView<String> lv = new ListView<>();
            lv.getSelectionModel().setSelectionMode(SelectionMode.MULTIPLE);
            JsonNode opts = metadata.path("options");
            if (opts.isArray()) {
                for (JsonNode opt : opts) {
                    lv.getItems().add(opt.path("label").asText(opt.path("value").asText()));
                }
            }
            lv.setPrefHeight(120);
            lv.setDisable(disabled || readOnly);
            lv.getSelectionModel().selectedItemProperty().addListener((obs, o, n) ->
                    ctx.currentComponentState.put(fieldId, lv.getSelectionModel().getSelectedItems()));
            return lv;
        }

        // Number (integer)
        if ("integer".equals(dataType) || "int".equals(dataType) || "long".equals(dataType)
                || "Integer".equals(dataType) || "Long".equals(dataType)) {
            if ("slider".equals(stereotype)) {
                int min = metadata.path("sliderMin").asInt(0);
                int max = metadata.path("sliderMax").asInt(100);
                Slider slider = new Slider(min, max, rawValue.asDouble(min));
                slider.setShowTickLabels(true);
                slider.setShowTickMarks(true);
                slider.setDisable(disabled || readOnly);
                slider.setMaxWidth(Double.MAX_VALUE);
                slider.valueProperty().addListener((obs, o, n) ->
                        ctx.currentComponentState.put(fieldId, n.intValue()));
                return slider;
            }
            TextField tf = new TextField(value);
            tf.setEditable(!readOnly && !disabled);
            tf.setMaxWidth(Double.MAX_VALUE);
            tf.textProperty().addListener((obs, o, n) -> {
                try { ctx.currentComponentState.put(fieldId, Integer.parseInt(n)); }
                catch (NumberFormatException ignored) {}
            });
            return tf;
        }

        // Decimal / money
        if ("number".equals(dataType) || "double".equals(dataType) || "float".equals(dataType)
                || "decimal".equals(dataType) || "BigDecimal".equals(dataType)
                || "money".equals(stereotype) || "currency".equals(stereotype)) {
            TextField tf = new TextField(value);
            tf.setEditable(!readOnly && !disabled);
            tf.setMaxWidth(Double.MAX_VALUE);
            tf.textProperty().addListener((obs, o, n) -> {
                try { ctx.currentComponentState.put(fieldId, Double.parseDouble(n)); }
                catch (NumberFormatException ignored) {}
            });
            return tf;
        }

        // Password
        if ("password".equals(stereotype)) {
            PasswordField pf = new PasswordField();
            pf.setText(value);
            pf.setEditable(!readOnly && !disabled);
            pf.setMaxWidth(Double.MAX_VALUE);
            pf.textProperty().addListener((obs, o, n) ->
                    ctx.currentComponentState.put(fieldId, n));
            return pf;
        }

        // Default: plain TextField
        TextField tf = new TextField(value);
        tf.setEditable(!readOnly && !disabled);
        tf.setMaxWidth(Double.MAX_VALUE);
        tf.textProperty().addListener((obs, o, n) ->
                ctx.currentComponentState.put(fieldId, n));
        return tf;
    }

    private String findLabelForValue(JsonNode options, String value) {
        for (JsonNode opt : options) {
            String optValue = opt.path("value").asText("");
            if (optValue.equals(value)) return opt.path("label").asText(optValue);
        }
        return value;
    }

    private String findValueForLabel(JsonNode options, String label) {
        for (JsonNode opt : options) {
            String optLabel = opt.path("label").asText("");
            if (optLabel.equals(label)) return opt.path("value").asText(optLabel);
        }
        return label;
    }

    public static Map<String, Integer> computeColspan(JsonNode metadata) {
        int colspan = metadata.path("colspan").asInt(1);
        return Map.of("colspan", colspan);
    }

    // ── Capture & tree widgets ─────────────────────────────────────────────────────

    private Node buildSignaturePad(String fieldId, String value, boolean readOnly) {
        VBox box = new VBox(6);
        if (value != null && value.startsWith("data:image")) {
            ImageView preview = dataUriImage(value, 320);
            Button again = new Button("Sign again");
            again.setDisable(readOnly);
            box.getChildren().addAll(preview, again);
            again.setOnAction(e -> box.getChildren().setAll(signatureCanvas(fieldId, box)));
            return box;
        }
        box.getChildren().setAll(signatureCanvas(fieldId, box));
        if (readOnly) box.setDisable(true);
        return box;
    }

    private Node[] signatureCanvas(String fieldId, VBox host) {
        javafx.scene.canvas.Canvas canvas = new javafx.scene.canvas.Canvas(380, 150);
        var g = canvas.getGraphicsContext2D();
        g.setLineWidth(2);
        boolean[] hasStrokes = {false};
        canvas.setOnMousePressed(e -> { g.beginPath(); g.moveTo(e.getX(), e.getY()); });
        canvas.setOnMouseDragged(e -> { g.lineTo(e.getX(), e.getY()); g.stroke(); hasStrokes[0] = true; });
        canvas.setStyle("-fx-cursor: crosshair;");
        StackPane frame = new StackPane(canvas);
        frame.setStyle("-fx-border-color: #b0b0b0; -fx-border-style: dashed; -fx-background-color: white;");
        frame.setMaxWidth(384);

        Button clear = new Button("Clear");
        clear.setOnAction(e -> { g.clearRect(0, 0, canvas.getWidth(), canvas.getHeight()); hasStrokes[0] = false; });
        Button accept = new Button("Accept");
        accept.setOnAction(e -> {
            if (!hasStrokes[0]) return;
            try {
                javafx.scene.image.WritableImage snapshot = canvas.snapshot(null, null);
                java.awt.image.BufferedImage buffered =
                        javafx.embed.swing.SwingFXUtils.fromFXImage(snapshot, null);
                java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream();
                javax.imageio.ImageIO.write(buffered, "png", out);
                String dataUri = "data:image/png;base64,"
                        + java.util.Base64.getEncoder().encodeToString(out.toByteArray());
                ctx.currentComponentState.put(fieldId, dataUri);
                host.getChildren().setAll(dataUriImage(dataUri, 320), new Label("Signed"));
            } catch (Exception ignored) {
                // snapshot/encode failed: leave the pad as is
            }
        });
        HBox actions = new HBox(8, clear, accept);
        return new Node[] { frame, actions };
    }

    private Node buildPhotoPicker(String fieldId, String value, boolean readOnly) {
        VBox box = new VBox(6);
        if (value != null && value.startsWith("data:image")) {
            box.getChildren().add(dataUriImage(value, 320));
        }
        Button pick = new Button(value != null && !value.isBlank() ? "Replace photo" : "Pick photo…");
        pick.setDisable(readOnly);
        Label hint = new Label("(no camera on desktop: picks an image file)");
        hint.getStyleClass().add("field-hint");
        pick.setOnAction(e -> {
            javafx.stage.FileChooser chooser = new javafx.stage.FileChooser();
            chooser.getExtensionFilters().add(
                    new javafx.stage.FileChooser.ExtensionFilter("Images", "*.png", "*.jpg", "*.jpeg", "*.gif"));
            java.io.File file = chooser.showOpenDialog(box.getScene() != null ? box.getScene().getWindow() : null);
            if (file == null) return;
            try {
                byte[] bytes = java.nio.file.Files.readAllBytes(file.toPath());
                String mime = file.getName().toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
                String dataUri = "data:" + mime + ";base64," + java.util.Base64.getEncoder().encodeToString(bytes);
                ctx.currentComponentState.put(fieldId, dataUri);
                box.getChildren().setAll(dataUriImage(dataUri, 320), pick, hint);
                pick.setText("Replace photo");
            } catch (Exception ignored) {
                // unreadable file: keep the previous value
            }
        });
        box.getChildren().addAll(pick, hint);
        return box;
    }

    private ImageView dataUriImage(String dataUri, double maxWidth) {
        ImageView view = new ImageView(new javafx.scene.image.Image(dataUri));
        view.setPreserveRatio(true);
        view.setFitWidth(maxWidth);
        return view;
    }

    private Node buildTreeSelect(String fieldId, JsonNode metadata, String value, boolean readOnly) {
        JsonNode options = metadata.path("options");
        boolean leavesOnly = metadata.path("treeLeavesOnly").asBoolean(false);

        javafx.scene.control.TreeItem<JsonNode> root = new javafx.scene.control.TreeItem<>(null);
        addTreeItems(root, options);
        javafx.scene.control.TreeView<JsonNode> tree = new javafx.scene.control.TreeView<>(root);
        tree.setShowRoot(false);
        tree.setPrefHeight(220);
        tree.setCellFactory(t -> new javafx.scene.control.TreeCell<>() {
            @Override
            protected void updateItem(JsonNode item, boolean empty) {
                super.updateItem(item, empty);
                setText(empty || item == null ? null : item.path("label").asText(item.path("value").asText()));
            }
        });

        String initialLabel = findTreeLabel(options, value);
        javafx.scene.control.MenuButton button =
                new javafx.scene.control.MenuButton(initialLabel != null ? initialLabel : "—");
        button.setDisable(readOnly);
        button.setMaxWidth(Double.MAX_VALUE);
        javafx.scene.control.CustomMenuItem item = new javafx.scene.control.CustomMenuItem(tree, false);
        button.getItems().add(item);

        tree.getSelectionModel().selectedItemProperty().addListener((obs, o, selected) -> {
            if (selected == null || selected.getValue() == null) return;
            boolean isGroup = !selected.getChildren().isEmpty();
            if (leavesOnly && isGroup) {
                selected.setExpanded(!selected.isExpanded());
                return;
            }
            JsonNode option = selected.getValue();
            ctx.currentComponentState.put(fieldId, option.path("value").asText(""));
            button.setText(option.path("label").asText(option.path("value").asText()));
            button.hide();
        });
        return button;
    }

    private void addTreeItems(javafx.scene.control.TreeItem<JsonNode> parent, JsonNode options) {
        if (!options.isArray()) return;
        for (JsonNode option : options) {
            javafx.scene.control.TreeItem<JsonNode> item = new javafx.scene.control.TreeItem<>(option);
            addTreeItems(item, option.path("children"));
            parent.getChildren().add(item);
        }
    }

    private String findTreeLabel(JsonNode options, String value) {
        if (!options.isArray() || value == null || value.isBlank()) return null;
        for (JsonNode option : options) {
            if (value.equals(option.path("value").asText())) {
                return option.path("label").asText(value);
            }
            String sub = findTreeLabel(option.path("children"), value);
            if (sub != null) return sub;
        }
        return null;
    }
}
