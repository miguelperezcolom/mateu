package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.fluent.Component;
import lombok.Builder;

/**
 * The page shown in place of a screen whose record or route does not exist: an icon, a heading, a
 * short explanation and a way back.
 *
 * <p>Mateu renders one by itself when loading a route fails with {@link
 * java.util.NoSuchElementException} — throw one with a user-facing message (<i>«Reserva FO-X6JB7F
 * no encontrada»</i>) from a view, a {@code view(id)} or a CRUD's {@code findById} and that message
 * becomes the heading. A view can also return this component directly.
 *
 * @param title the heading; the renderer falls back to a generic "Not found" when null
 * @param message the secondary line under the heading
 * @param backRoute where the way back goes (a route of the app); none when null
 * @param backLabel the text of the way back
 */
@Builder
@Experimental("not-found page (3.0-alpha.40x)")
public record NotFound(
    String id,
    String title,
    String message,
    String backRoute,
    String backLabel,
    String style,
    String cssClasses)
    implements Component {}
