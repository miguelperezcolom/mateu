---
title: "The authoring rule"
description: "When something is an annotation, an interface, or something Mateu infers for you — and the criterion that decides."
---

Mateu has a large declarative surface. It has stayed learnable because of one rule that has governed
it from the start — and this page writes it down, because a rule nobody can read is a rule only the
maintainer can apply.

If you are extending Mateu, this decides where your new capability belongs. If you are only using
it, it explains why the API looks the way it does, and lets you guess right about parts you have not
read yet.

## Two questions

The first splits by **when the answer is known**:

> **Annotation** — purely declarative: known at compile time, no decision to make.
> **Interface (supplier / abstract method)** — there is a decision, and it is taken at runtime.

That is why a page's subtitle is `@Subtitle("…")` *and* `SubtitleSupplier.subtitle()`: one is a
constant, the other is computed. The same pair appears for the title, the overline, the title
placeholder, peer navigation, page width. **When both are present, the supplier wins** — a runtime
value outranks a declared one.

The second question splits by **who decides**:

|  | **you decide** | **Mateu decides** |
|---|---|---|
| **compile time** | annotation | inference from the shape of your model |
| **runtime** | interface / abstract method | inference + composition |

The left-hand column is the rule above. The right-hand column is
[layout inference](/ux-patterns/layout-inference/) and page inference: Mateu reading the
information you declared and choosing the presentation you did not.

This is why `@AutoPage` feels unlike every other annotation: **its content is not information, it is
permission** — "decide this for me". It is not a declaration, it is a change of column.

## The criterion

From those two axes comes the rule that decides where a new capability goes:

> **An annotation is legitimate when it carries information that only you have.**
> **It is debt when it carries a decision Mateu could take by looking at the model.**

A `@Timestamp` field marks *which* of your fields is the last-updated one — Mateu cannot know that;
information only you have. A two-column layout for a form of six short fields is *not* information:
it is a decision derivable from the fields, so it is inferred, and the annotation exists only to
override.

Applied consistently, the surface shrinks as inference improves instead of accumulating.

## It also decides where your screen runs

The same partition governs delivery, which is why it is worth getting right:

| Authoring | Delivery |
|---|---|
| **annotation** — compile time, no decision | can be pre-rendered into a [static bundle](/java-user-manual/build/static-bundle/) and served from a CDN |
| **interface** — decision at runtime | needs the server |

Both ask the same thing: *can this be known without the request?* So the rule of thumb for "will this
screen work with no backend" is not a list of exceptions to memorise — it is
**if you declared it with annotations, it can ship statically; if you used an interface, it needs a
server.**

## What Mateu will not infer

Inference has a ceiling, and it is worth knowing where it is so you do not wait for a version that
lifts it. See [the limits of inference](/ux-patterns/layout-inference/#the-limits-of-inference).
