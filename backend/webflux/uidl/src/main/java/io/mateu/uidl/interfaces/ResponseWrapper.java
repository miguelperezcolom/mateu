package io.mateu.uidl.interfaces;

import java.util.List;

public record ResponseWrapper(Object response, List<Message> messages) {}
