package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.Map;

public record Element(String name, Map<String, String> attributes, String content)
    implements Component {}
