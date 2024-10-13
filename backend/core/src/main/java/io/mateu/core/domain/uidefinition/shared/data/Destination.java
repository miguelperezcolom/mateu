package io.mateu.core.domain.uidefinition.shared.data;

public record Destination(
        String id,
        DestinationType type,
        String description,
        String value) {
}
