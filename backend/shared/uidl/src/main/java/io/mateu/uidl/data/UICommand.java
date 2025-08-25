package io.mateu.uidl.data;

import lombok.Builder;

@Builder
public record UICommand(UICommandType type, Object data) {}
