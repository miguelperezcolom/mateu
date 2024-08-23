package io.mateu.core.domain.uidefinition.shared.elements;

import java.util.Map;

public record Element(String name, String content, Map<String, String> attributes) {

    public Element(String name, String content) {
        this(name, content, Map.of());
    }
}
