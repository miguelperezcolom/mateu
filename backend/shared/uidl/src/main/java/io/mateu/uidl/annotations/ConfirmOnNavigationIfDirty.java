package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Enables dirty-state tracking on a form component. When the user modifies any field, the
 * component is marked as dirty and the frontend shows a confirmation dialog if the user tries to
 * navigate away before saving.
 *
 * <p>Use {@link io.mateu.uidl.data.UICommand#markAsClean()} in the save action to clear the dirty
 * state after a successful save. To mark the form dirty programmatically, return
 * {@link io.mateu.uidl.data.UICommand#markAsDirty()} from any action.
 *
 * <p>CRUD create and edit views activate this behaviour automatically without requiring this
 * annotation.
 *
 * <pre>{@code
 * @ConfirmOnNavigationIfDirty
 * public class MyForm {
 *     String name;
 *
 *     @Toolbar
 *     Object save() {
 *         // persist ...
 *         return UICommand.markAsClean();
 *     }
 * }
 * }</pre>
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE})
public @interface ConfirmOnNavigationIfDirty {
}
