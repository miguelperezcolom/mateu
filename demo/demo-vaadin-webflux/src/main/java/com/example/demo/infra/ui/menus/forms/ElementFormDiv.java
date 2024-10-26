package com.example.demo.infra.ui.menus.forms;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Attribute;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Content;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Element;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.On;
import io.mateu.core.domain.uidefinitionlanguage.shared.data.ClientSideEvent;

import java.time.LocalTime;

@Element("div")
public class ElementFormDiv {

    @Attribute
    String style = "width: 200px; height: 100px; background-color: #f5f5f5; cursor: pointer;";

    @Content
    String content = "Hola!";

    @On(value = "click", js = "this.dispatchEvent(new CustomEvent('run-action', {\n" +
            "              detail: {\n" +
            "                actionId: 'xx',\n" +
            "              },\n" +
            "              bubbles: true,\n" +
            "              composed: true\n" +
            "            }))")
    public void clicked(ClientSideEvent event) throws JsonProcessingException { //
        content = "Clicked at " + LocalTime.now() + " " + new ObjectMapper().writeValueAsString(event);
    }

}
