package io.mateu.uidl.data;

/**
 * What opens a {@link Popover}: a {@code click} on the wrapped component (the default), or {@code
 * hover} — pointing at it, or focusing it from the keyboard — for read-only details such as a rate
 * breakdown or a reservation summary.
 */
public enum PopoverTrigger {
  click,
  hover
}
