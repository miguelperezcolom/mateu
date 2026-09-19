---
title: "Governance and continuity"
description: "The honest answer to 'it's a small project — what if the maintainer disappears?' — what AI changes, what it does not, and the mitigation package that makes the residual risk acceptable."
---

The most legitimate objection to adopting Mateu is not technical, it is organizational: **it is a
small open-source project with a small maintainer team.** A serious architecture committee will ask
"what if the maintainer disappears?", and the honest answer is not a slogan — it is this page.

This is the companion of [Portability & exit strategy](/mateu-about/portability-and-exit/): that page
is about *leaving*; this one is about *staying safely* — who is accountable, and how the project does
not die on you.

## The honest risk

- **Maturity:** what ships is the **GA of v3, not v1** — the model has years in production across
  major versions (Quotravel, then Wefox's broker portal, the latter with its own corporate design
  system). The version number is accumulated iteration, not immaturity.
- **But:** the ecosystem is small, the talent pool for "people who already know Mateu" is tiny, and
  the framework core is effectively stewarded by a small team. That is real and we do not paper over it.

## What AI changes — and what it does not

AI genuinely changes the *shape* of this risk. It does not make it disappear.

- **It neutralizes the "you need a community to use it" half.** Because the authoring surface is a
  small, open-source, AI-legible DSL, an AI plus a competent director can build missing application
  features on demand, self-serve usage support, and onboard people — without depending on ecosystem
  size or a hiring market for Mateu-specific skills. For *day-to-day adoption*, "no big community" is
  largely a non-issue. (See [Mateu and AI](/mateu-about/mateu-and-ai/).)
- **It does not transfer accountability.** AI reduces the *labour* needed to steward the framework
  core; it removes **none** of the accountability, liability, security warranty, or deep design-intent
  ownership that a vendor or community implicitly provides. AI is a force multiplier on a steward, not
  a substitute for one — and unmanaged, AI can even *mask* the design-intent bus factor by confidently
  editing code no human still fully judges.

> **Committee-proof framing:** AI turns *"we need a community to use it"* into a non-issue; it turns
> *"we need someone accountable to steward it"* into a **governance requirement, not a labour problem**
> — and that governance must be funded, not assumed.

So the risk splits: **low on adoption, medium on core stewardship** — and the medium is acceptable
*only if* the mitigations below are actually in place.

## The mitigation package

### 1. Open source + fork-readiness (the structural backstop)
Mateu is Apache 2.0 (permissive, explicit patent grant). Continuity does not depend on upstream:
keep a **buildable internal fork with its own CI**, pin the version you run, own the build. If upstream
stops, you are already running your own code. See [Portability & exit strategy](/mateu-about/portability-and-exit/).

### 2. The definition is a portable asset you own
Your UI is declarative data in your repository, renderable by another engine (there is a
[reference renderer](/design-systems/reference-renderer/) proving it). Your investment is not trapped
in the runtime. See [the wire specification](/reference/wire-specification/).

### 3. At least two people who can *judge* the core
The real bus factor is not "can code be written" (AI covers that) but "is there a human who understands
the design intent well enough to **accept or reject** an AI-proposed change and catch a plausible-but-
wrong one." Mitigation: **≥2 people** able to judge framework/mapper/port changes, and **human sign-off
required** on any core/mapper/port change. This is the single most important item.

### 4. An architecture & invariants guide
Make ownership *transferable*: formalize the framework's cross-cutting invariants and known failure
modes (the hard-won "gotchas") into a maintainer's guide, so a second steward can ramp up and AI output
can be checked against written invariants rather than tribal knowledge.

### 5. A support / ownership charter (name who is answerable)
A committee needs a responsible party. Choose one, explicitly:
- **Commercial support agreement with the maintainer** — turns the author into an accountable vendor
  with an SLA; or
- **Internal ownership charter** — Riu names the internal team/owner answerable for the framework as
  deployed.
Either is fine; *unstated* is not.

### 6. Periodic independent security review
AI plus a single author cannot self-certify security. Commission a **periodic external audit** of the
framework as deployed. (Mateu already runs CodeQL and ships a11y/RBAC by construction, but that is not
a substitute for independent review at adoption scale.)

## What this asks of Riu

Governance is a **funded commitment**, not a free property of open source:

- Allocate/provide the **second steward** (or fund the maintainer relationship that supplies judgement).
- Stand up the **internal fork + CI** and the **version-pinning** discipline.
- Choose and sign the **support/ownership charter**.
- Budget the **periodic security audit**.

Do these, and "small OSS project" moves from an unmanaged risk to a managed one. Skip them, and a
committee is right to treat the risk as material — which is exactly why they are stated here rather
than hidden.

## Decision points (maintainer / Riu)

- Who are the **≥2 core judges**, and what is the sign-off rule?
- **Support model:** commercial SLA vs internal ownership charter?
- Who commissions and pays for the **security audit**, and how often?
- Where does the **architecture & invariants guide** live, and who keeps it current?
