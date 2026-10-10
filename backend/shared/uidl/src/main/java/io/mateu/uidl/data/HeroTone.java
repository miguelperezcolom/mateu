package io.mateu.uidl.data;

/**
 * The tone of a hero band (the Redwood welcome-page {@code backgroundColor} palette, expressed
 * design-system-neutrally): {@code auto} keeps the renderer's default hero (an image overlay or the
 * theme's base); the others paint a DARK tinted band with light ink. The names are hues, not brand
 * colors — each renderer maps them onto its own palette.
 */
public enum HeroTone {
  auto,
  ocean,
  pine,
  lilac,
  teal,
  rose,
  pebble,
  slate,
  plum,
  sienna
}
