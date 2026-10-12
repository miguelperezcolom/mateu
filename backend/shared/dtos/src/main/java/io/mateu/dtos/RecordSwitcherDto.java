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
    String actionId,
    /**
     * Where the options come from when they are not listed: a REST source the browser fetches (a
     * data-authored page's {@code optionsSource:}). {@code null} for a supplier's switcher.
     */
    RestDataSourceDto optionsSource,
    /**
     * Where a pick navigates, {@code ${state._record}} standing for the picked value; {@code null}
     * dispatches {@link #actionId()} instead.
     */
    String route) {}
