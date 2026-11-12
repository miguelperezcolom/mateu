package io.mateu.test;

import io.mateu.uidl.annotations.Experimental;

/**
 * A command the server sent to the UI ({@code NavigateTo}, {@code SetWindowTitle}, {@code
 * CloseModal}, {@code DispatchEvent}…), as the wire carries it.
 *
 * @param type the command type
 * @param data its payload (a route, a title, a map…), as JSON
 */
@Experimental("test harness (3.0)")
public record Command(String type, Object data) {}
