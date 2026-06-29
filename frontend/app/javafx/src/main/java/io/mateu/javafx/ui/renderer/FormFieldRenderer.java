package io.mateu.javafx.ui.renderer;

import com.fasterxml.jackson.databind.JsonNode;
import io.mateu.javafx.ui.AppContext;
import javafx.scene.Node;
import javafx.scene.control.*;
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
}
