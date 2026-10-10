package io.mateu.dtos;

import java.util.List;
import lombok.Builder;

/**
 * The record/context switcher of the page header (the Redwood {@code selectObject}/{@code
 * selectContext} element). Picking an option dispatches {@code actionId} with the picked value in
 * the {@code _record} parameter.
 *
 * @param type {@code "object"} (the record shown) or {@code "context"} (what the page is evaluated
 *     in)
 */
@Builder
public record RecordSwitcherDto(
    List<OptionDto> options,
    String value,
    String type,
    String label,
    boolean searchable,
    boolean disabled,
    String actionId) {}
