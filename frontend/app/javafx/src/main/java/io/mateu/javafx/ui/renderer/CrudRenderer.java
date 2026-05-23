package io.mateu.javafx.ui.renderer;

import com.fasterxml.jackson.databind.JsonNode;
import io.mateu.javafx.ui.AppContext;
import javafx.beans.property.SimpleStringProperty;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.geometry.Insets;
import javafx.scene.Node;
import javafx.scene.control.*;
import javafx.scene.layout.*;

import java.util.ArrayList;
import java.util.List;

public class CrudRenderer {

    private final AppContext ctx;

    public CrudRenderer(AppContext ctx) {
        this.ctx = ctx;
    }

    public Node render(JsonNode component, JsonNode crudMetadata, JsonNode state, JsonNode data) {
        String title = crudMetadata.path("title").asText("");
        String subtitle = crudMetadata.path("subtitle").asText("");
        boolean canEdit = crudMetadata.path("canEdit").asBoolean(false);
        boolean searchable = crudMetadata.path("searchable").asBoolean(false);
        String detailPath = crudMetadata.path("detailPath").asText("");

        BorderPane root = new BorderPane();
        root.getStyleClass().add("content-area");

        // Header
        VBox header = buildHeader(title, subtitle, crudMetadata);
        if (!header.getChildren().isEmpty()) {
            root.setTop(header);
        }

        // Table
        TableView<JsonNode> table = buildTable(crudMetadata, detailPath, canEdit);

        // Load data into table
        List<JsonNode> rows = extractRows(data);
        ObservableList<JsonNode> items = FXCollections.observableArrayList(rows);
        table.setItems(items);
        VBox.setVgrow(table, Priority.ALWAYS);

        // Pagination info
        long totalElements = data != null && !data.isNull() ? data.path("totalElements").asLong(rows.size()) : rows.size();
        int pageSize = data != null && !data.isNull() ? data.path("pageSize").asInt(rows.size()) : rows.size();
        int pageNumber = data != null && !data.isNull() ? data.path("pageNumber").asInt(0) : 0;

        VBox center = new VBox();
        VBox.setVgrow(table, Priority.ALWAYS);

        if (searchable) {
            HBox searchBar = buildSearchBar();
            center.getChildren().add(searchBar);
        }

        center.getChildren().add(table);
        VBox.setVgrow(table, Priority.ALWAYS);
        root.setCenter(center);

        // Pagination bar
        if (totalElements > pageSize && pageSize > 0) {
            HBox paginationBar = buildPaginationBar(pageNumber, pageSize, totalElements);
            root.setBottom(paginationBar);
        }

        // Register data handler so search responses (component=null, data=present) update the table
        ctx.registerDataHandler("crud", searchData -> {
            JsonNode pageData = searchData.path("crud").path("page");
            if (pageData.isMissingNode() || pageData.isNull()) pageData = searchData;
            items.setAll(extractRows(pageData));
            long total = pageData.path("totalElements").asLong(0);
            int sz = pageData.path("pageSize").asInt(0);
            int pg = pageData.path("pageNumber").asInt(0);
            root.setBottom(total > sz && sz > 0 ? buildPaginationBar(pg, sz, total) : null);
        });

        return root;
    }

    private VBox buildHeader(String title, String subtitle, JsonNode crudMetadata) {
        VBox header = new VBox(4);
        header.setPadding(new Insets(0, 0, 12, 0));

        if (!title.isBlank()) {
            Label titleLabel = new Label(title);
            titleLabel.getStyleClass().add("form-title");
            header.getChildren().add(titleLabel);
        }
        if (!subtitle.isBlank()) {
            Label subtitleLabel = new Label(subtitle);
            subtitleLabel.getStyleClass().add("form-subtitle");
            header.getChildren().add(subtitleLabel);
        }

        // Toolbar buttons
        HBox toolbar = new HBox(8);
        toolbar.getStyleClass().add("crud-toolbar");

        JsonNode toolbarNodes = crudMetadata.path("toolbar");
        if (toolbarNodes.isArray()) {
            for (JsonNode btn : toolbarNodes) {
                Button button = buildButton(btn);
                toolbar.getChildren().add(button);
            }
        }

        if (!toolbar.getChildren().isEmpty()) {
            header.getChildren().add(toolbar);
        }

        return header;
    }

    @SuppressWarnings("unchecked")
    private TableView<JsonNode> buildTable(JsonNode crudMetadata, String detailPath, boolean canEdit) {
        TableView<JsonNode> table = new TableView<>();
        table.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY_FLEX_LAST_COLUMN);
        table.setMaxHeight(Double.MAX_VALUE);

        JsonNode columns = crudMetadata.path("columns");
        if (columns.isArray()) {
            for (JsonNode col : columns) {
                JsonNode colMeta = col.path("metadata");
                // GridColumn uses "id" for the data field; FormField uses "fieldId"
                String fieldId = colMeta.path("id").asText(col.path("id").asText(""));
                String label = colMeta.path("label").asText(fieldId);

                TableColumn<JsonNode, String> tableCol = new TableColumn<>(label);
                tableCol.setCellValueFactory(cellData -> {
                    JsonNode row = cellData.getValue();
                    JsonNode val = row.path(fieldId);
                    String text;
                    if (val.isNull() || val.isMissingNode()) {
                        text = "";
                    } else if (val.isObject()) {
                        // Status/badge objects: prefer "message", then "value", then toString
                        JsonNode msg = val.path("message");
                        text = (!msg.isMissingNode() && !msg.isNull())
                                ? msg.asText() : val.path("value").asText(val.toString());
                    } else {
                        text = val.asText();
                    }
                    return new SimpleStringProperty(text);
                });
                table.getColumns().add(tableCol);
            }
        }

        // Actions column for detail/edit
        if (!detailPath.isBlank() || canEdit) {
            TableColumn<JsonNode, String> actionsCol = new TableColumn<>("Actions");
            actionsCol.setMaxWidth(120);
            actionsCol.setMinWidth(80);
            actionsCol.setCellFactory(col -> new TableCell<>() {
                private final Button viewBtn = new Button(canEdit ? "Edit" : "View");
                {
                    viewBtn.getStyleClass().add("btn-default");
                    viewBtn.setOnAction(e -> {
                        JsonNode row = getTableView().getItems().get(getIndex());
                        String rowId = extractRowId(row);
                        String route = detailPath.isBlank()
                                ? ctx.currentRoute + "/" + rowId
                                : detailPath + "/" + rowId;
                        ctx.navigate(route, ctx.currentConsumedRoute, ctx.currentServerSideType, "");
                    });
                }

                @Override
                protected void updateItem(String item, boolean empty) {
                    super.updateItem(item, empty);
                    setGraphic(empty ? null : viewBtn);
                }
            });
            table.getColumns().add(actionsCol);
        }

        return table;
    }

    private List<JsonNode> extractRows(JsonNode data) {
        List<JsonNode> rows = new ArrayList<>();
        if (data == null || data.isNull()) return rows;

        JsonNode content = data.has("content") ? data.path("content") : data;
        if (content.isArray()) {
            content.forEach(rows::add);
        }
        return rows;
    }

    private String extractRowId(JsonNode row) {
        for (String idField : List.of("id", "_id", "key", "uuid")) {
            JsonNode v = row.path(idField);
            if (!v.isMissingNode() && !v.isNull()) return v.asText();
        }
        return "";
    }

    private HBox buildPaginationBar(int pageNumber, int pageSize, long totalElements) {
        HBox bar = new HBox(8);
        bar.getStyleClass().add("action-bar");
        bar.setPadding(new Insets(8, 16, 8, 16));

        long totalPages = (totalElements + pageSize - 1) / pageSize;
        Label info = new Label("Page " + (pageNumber + 1) + " of " + totalPages
                + " (" + totalElements + " total)");

        Button prev = new Button("← Previous");
        prev.getStyleClass().add("btn-default");
        prev.setDisable(pageNumber <= 0);
        prev.setOnAction(e -> ctx.runAction("prevPage", null));

        Button next = new Button("Next →");
        next.getStyleClass().add("btn-default");
        next.setDisable((long) (pageNumber + 1) * pageSize >= totalElements);
        next.setOnAction(e -> ctx.runAction("nextPage", null));

        bar.getChildren().addAll(prev, info, next);
        return bar;
    }

    private HBox buildSearchBar() {
        HBox bar = new HBox(8);
        bar.setPadding(new Insets(0, 0, 8, 0));

        TextField field = new TextField();
        field.setPromptText("Search...");
        field.setMaxWidth(Double.MAX_VALUE);
        HBox.setHgrow(field, Priority.ALWAYS);
        Object cur = ctx.currentComponentState.get("searchText");
        if (cur != null) field.setText(cur.toString());

        Runnable doSearch = () -> {
            ctx.currentComponentState.put("searchText", field.getText());
            ctx.currentComponentState.put("page", 0);
            ctx.currentComponentState.putIfAbsent("size", 10);
            ctx.currentComponentState.putIfAbsent("sort", java.util.List.of());
            ctx.runAction("search", null);
        };

        Button btn = new Button("Search");
        btn.getStyleClass().add("btn-primary");
        btn.setOnAction(e -> doSearch.run());
        field.setOnAction(e -> doSearch.run());

        bar.getChildren().addAll(field, btn);
        return bar;
    }

    private Button buildButton(JsonNode btn) {
        String id = btn.path("id").asText("");
        String label = btn.path("label").asText(id);
        Button button = new Button(label);
        boolean primary = "Primary".equals(btn.path("buttonStyle").asText(""));
        button.getStyleClass().add(primary ? "btn-primary" : "btn-default");
        button.setOnAction(e -> ctx.runAction(id, null));
        return button;
    }
}
