package com.example.demo.infra.in.ui.fluent.components;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Anchor;
import io.mateu.uidl.data.Element;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.data.UICommandType;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.HasTriggers;
import io.mateu.uidl.fluent.OnValueChangeTrigger;
import io.mateu.uidl.fluent.Trigger;
import io.mateu.uidl.interfaces.CommandSupplier;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HandlesActions;
import io.mateu.uidl.interfaces.HttpRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;

@Route("/fluent-app/components/web-component")
public class WebComponentComponentPage implements ComponentTreeSupplier, HandlesActions, CommandSupplier, HasTriggers {
    private static final Logger log = LoggerFactory.getLogger(WebComponentComponentPage.class);

    String src = "/images/model-viewer/NeilArmstrong.glb";



    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Web component")
                .content(List.of(
                        FormField.builder()
                                .id("src")
                                .dataType(FieldDataType.string)
                                .stereotype(FieldStereotype.radio)
                                .options(List.of(
                                        new Option("/images/model-viewer/NeilArmstrong.glb", "Neil Armstrong"),
                                        new Option("/images/model-viewer/ford_mustang_1965.glb", "Ford Mustang"),
                                        new Option("/images/model-viewer/lockheed_martin_c130jsuper_hercules_reupload.glb", "C-130"),
                                        new Option("/images/model-viewer/AstonMartinVantageN430GT4.glb", "Aston Marin")
                                ))
                                .build(),
                        Element.builder()
                                .name("model-viewer")
                                .attributes(Map.of(
                                        "src", src,
                                        "auto-rotate", "auto-rotate",
                                        "camera-controls", "camera-controls"
                                ))
                                .style("width: 30rem; height: 30rem;")
                                .on(Map.of(
                                        "load", "model-loaded",
                                        "click", "model-clicked"
                                ))
                                .build()
                ))
                .build();
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        if ("src-changed".equals(actionId)) {
            return this;
        }
        if ("model-loaded".equals(actionId) || "model-clicked".equals(actionId)) {
            log.info("received {} {}", actionId, httpRequest.getParameters(Map.class).get("event"));
            return Message.builder()
                    .text(actionId)
                    .build();
        }
        return null;
    }

    @Override
    public List<UICommand> commands(HttpRequest httpRequest) {
        return List.of(UICommand.builder()
                        .type(UICommandType.AddContentToHead)
                        .data(Element.builder()
                                .name("script")
                                // <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.0.1/model-viewer.min.js"></script>
                                .attributes(Map.of(
                                        "id", "model-viewer-js",
                                        "src", "https://ajax.googleapis.com/ajax/libs/model-viewer/3.0.1/model-viewer.min.js",
                                        "type", "module"
                                ))
                                .build())
                .build());
    }

    @Override
    public List<Trigger> triggers() {
        return List.of(OnValueChangeTrigger.builder()
                        .propertyName("src")
                        .actionId("src-changed")
                .build());
    }
}
