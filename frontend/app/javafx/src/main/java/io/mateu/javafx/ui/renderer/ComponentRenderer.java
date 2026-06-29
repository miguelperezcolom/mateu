package io.mateu.javafx.ui.renderer;

import com.fasterxml.jackson.databind.JsonNode;
import io.mateu.javafx.ui.AppContext;
import javafx.scene.Node;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.layout.StackPane;

public class ComponentRenderer {

    private final AppContext ctx;

    public ComponentRenderer(AppContext ctx) {
        this.ctx = ctx;
    }

    public Node render(JsonNode component, JsonNode state, JsonNode data) {
        if (component == null || component.isNull() || component.isMissingNode()) {
            return new StackPane();
        }

        String type = component.path("type").asText("ClientSide");

        return switch (type) {
            case "ClientSide" -> renderClientSide(component, state, data);
            case "ServerSide" -> ctx.loadServerSideComponent(component);
            default -> new Label("Unknown component type: " + type);
        };
    }

    private Node renderClientSide(JsonNode component, JsonNode state, JsonNode data) {
        JsonNode metadata = component.path("metadata");
        String metaType = metadata.path("type").asText("");

        return switch (metaType) {
            case "App" -> new AppRenderer(ctx).render(component, metadata);
            case "Page" -> new PageRenderer(ctx).render(component, metadata, state, data);
            case "Form" -> {
                updateSscContext(component);
                yield new FormRenderer(ctx).render(component, metadata, state, data);
            }
            case "Crud" -> {
                updateSscContext(component);
                yield new CrudRenderer(ctx).render(component, metadata, state, data);
            }
            case "FormField" -> new FormFieldRenderer(ctx).render(metadata, state, data);
            case "FormLayout" -> new LayoutRenderer(ctx).renderVBox(component, metadata, state, data);
            case "FormRow" -> new LayoutRenderer(ctx).renderHBox(component, metadata, state, data);
            case "HorizontalLayout" -> new LayoutRenderer(ctx).renderHBox(component, metadata, state, data);
            case "VerticalLayout" -> new LayoutRenderer(ctx).renderVBox(component, metadata, state, data);
            case "Button" -> {
                String id = metadata.path("id").asText("");
                String label = metadata.path("label").asText(id);
                String actionId = metadata.path("actionId").asText(id);
                Button btn = new Button(label);
                btn.getStyleClass().add("btn-default");
                btn.setOnAction(e -> ctx.runAction(actionId, null));
                yield btn;
            }
            case "Text" -> {
                Label l = new Label(metadata.path("text").asText(""));
                l.setWrapText(true);
                yield l;
            }
            case "FormSection" -> new ContainerRenderer(ctx).renderSection(component, metadata, state, data);
            case "FormSubSection" -> new ContainerRenderer(ctx).renderSubSection(component, metadata, state, data);
            case "Card" -> new ContainerRenderer(ctx).renderCard(component, metadata, state, data);
            case "TabLayout" -> new ContainerRenderer(ctx).renderTabs(component, state, data);
            case "AccordionLayout" -> new ContainerRenderer(ctx).renderAccordion(component, state, data);
            case "SplitLayout" -> new ContainerRenderer(ctx).renderSplit(component, metadata, state, data);
            case "Scroller", "FullWidth", "Container", "Div" -> new LayoutRenderer(ctx).renderVBox(component, metadata, state, data);
            case "Badge" -> new ContainerRenderer(ctx).renderBadge(metadata);
            case "Anchor" -> new ContainerRenderer(ctx).renderAnchor(metadata);
            case "ProgressBar" -> new ContainerRenderer(ctx).renderProgressBar(metadata, state);
            case "Dialog" -> new ContainerRenderer(ctx).renderDialog(component, metadata, state, data);
            case "ConfirmDialog" -> new ContainerRenderer(ctx).renderConfirmDialog(metadata, state, data);
            default -> {
                if (!metaType.isBlank()) {
                    yield new Label("Unsupported component: " + metaType);
                }
                // No metadata type → try to render children
                yield new LayoutRenderer(ctx).renderVBox(component,
                        ctx.mapper.createObjectNode(), state, data);
            }
        };
    }

    private void updateSscContext(JsonNode component) {
        // ClientSide components don't have route/serverSideType themselves,
        // but we can use the current context set by the parent SSC loader
        String id = component.path("id").asText("");
        if (!id.isBlank()) ctx.currentComponentId = id;
    }
}
