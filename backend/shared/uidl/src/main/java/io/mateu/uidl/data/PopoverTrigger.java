package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;

/**
 * What opens a {@link Popover}: a {@code click} on the wrapped component (the default), or {@code
 * hover} — pointing at it, or focusing it from the keyboard — for read-only details such as a rate
 * breakdown or a reservation summary.
 */
@Experimental("hover popovers (3.0-alpha.409)")
public enum PopoverTrigger {
  click,
  hover
}
