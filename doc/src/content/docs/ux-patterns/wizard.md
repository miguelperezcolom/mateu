---
title: Wizard
description: Guide sequential flows with inter-step dependencies.
---

**Status:** ✅ Implemented

## Intent

Guide sequential flows where each step depends on what was chosen in earlier steps.

A wizard is also how you build the Oracle Redwood **Guided Process** page template: a long task broken
into named steps with a table of contents beside them, that the user can leave and resume — see
[The Redwood guided process](#the-redwood-guided-process) below.

## Problem

An onboarding flow where step 3 depends on what was selected in step 1 cannot be safely collapsed into one large form — the user could advance without completing required choices, or see irrelevant fields. Jumping between pages with no intermediate validation breaks the flow.

## Solution

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

Extend `Wizard` and declare one field per step; each field's type must implement `WizardStep`. Mateu renders the current step's form, a progress indicator, and navigation buttons automatically. The progress indicator is a bar by default; annotate the wizard with `@WizardProgress(WizardProgressStyle.STEPS)` to show connected step bullets instead (one numbered dot per applicable step with done/current/upcoming states — skipped branching steps are excluded, and every dot shows done on the result screen), or `@WizardProgress(WizardProgressStyle.RAIL)` for the guided-process lateral rail: the step form on the left and a sticky right-hand band with a big `current | total` counter over the vertical step list (demo: `/branching-wizard`). In the Redwood renderer `STEPS` draws the steps as a horizontal train across the top of the page (an `oj-train`; done steps can be clicked to go back, and on narrow screens the same steps are listed vertically), with the wire's Back / Next / completion buttons in the footer; `RAIL` draws the Oracle Redwood Guided Process page template (`oj-sp-guided-process`): the wizard opens on its overview — the wizard's title and `@Subtitle` over the steps as columns side by side, a completed step marked as such — and Start (or Resume) opens the steps one at a time with the step list on the right; the template's own texts (Start, Continue, Cancel, Completed) follow the browser's language. In both renderers `Next` only leaves a step whose required fields (`@NotNull`, `@NotEmpty`, `@NotBlank`, `RequiredSupplier`) are filled in: the browser marks the empty ones and focuses the first, and the server checks them again before moving on (an error message names them). The Back and Next labels go through the app's `Translator` like every other Mateu text (`Back=Atrás` / `Next=Siguiente` in a `messages_<lang>.properties`), or the wizard fixes them with `@WizardLabels(back = "Atrás", next = "Siguiente")`; the completion button's label is its method's `@Label`. State set in **any** step — by the user or by an action — survives navigation in both directions and reaches the completion action, so steps can freely read what earlier (or later) steps produced.

```java
// Each step is a plain class or record implementing WizardStep
public class AccountTypeStep implements WizardStep {

    @NotNull
    AccountType accountType;
}

public class CompanyDetailsStep implements WizardStep {

    String companyName;
    String vatNumber;
}

// Result step — read-only screen shown after completion
public class OnboardingResult implements WizardStep {

    @PlainText String summary = "Account created successfully.";
}

// The wizard class
@UI("/onboarding")
public class OnboardingWizard extends Wizard {

    AccountTypeStep step1 = new AccountTypeStep();
    CompanyDetailsStep step2 = new CompanyDetailsStep();
    OnboardingResult result;   // null → auto-instantiated after @WizardCompletionAction

    @WizardCompletionAction
    @Action(validationRequired = true)
    Object finish() {
        accountService.create(step1, step2);
        result = new OnboardingResult();  // optional: set explicitly for custom data
        return null;
    }
}
```

## How it works

| Step position | Behaviour |
|---|---|
| Any intermediate step | Shows **Next →** (and **← Back** after step 1). Validation runs on **Next →**. |
| Penultimate step | Shows the `@WizardCompletionAction` button instead of **Next →**. |
| Last step | **Read-only result screen.** No navigation buttons. Progress bar shows 100 %. |

**The last step field is always the result screen**, whatever its type: **Next →** never reaches it, only the completion action does. It is not a step of the process, so the step indicators leave it out; its `@Label` travels with them as the result's title (`resultTitle` on the `ProgressSteps`), and the Redwood guided process titles its finished screen with it (a translated "Completed" when it has none) without counting it in the `n | total` counter. A wizard with three input steps therefore declares four step fields — the fourth being what the user sees once it is done. The last step is instantiated automatically with its default field values if it is `null` when `@WizardCompletionAction` returns — or the wizard can set it explicitly inside the completion method.

A step can carry buttons of its own: its `@Toolbar` methods are drawn under the step's form, and clicking one runs it on the step as the user left it (hydrated with what was typed, not validated — a "Suggest" or "Check" helper works on a half-filled step). The wizard then shows the same step again with whatever the method changed; a `Message` it returns shows over it, and any other answer (a navigation, an overlay) is the response.

```java
public class ContactStep implements WizardStep {
    public String email;

    @Toolbar
    @Label("Use my work email")
    public void useWorkEmail() {
        email = "me@example.com";
    }
}
```

The completion method's return value decides where the wizard goes:

| Returns | Result |
|---|---|
| `null` | The result step. |
| `Message.error(...)` (or any other object) | That answer, and the wizard stays on the step. |
| A `Flux` — typically a [`LongTask`](/ux-patterns/long-running-jobs/) | The progress streams live, then the result step. If the stream emits a `Message.error`, the wizard stays on the step instead. |

A completion method declared to return a `Flux` is advertised as an SSE action, so the client receives the progress as it is produced:

```java
@WizardCompletionAction
@Label("Run end of day")
Flux<?> run() {
  if (!cashiers.closeAll) {
    return Flux.just(Message.error("Close the open cashiers first."));
  }
  return LongTask.create("Running end of day")
      .withProgressBar()
      .run(progress -> Flux.fromIterable(procedures)
          .map(p -> progress.step(p.run(), p.index() / (double) procedures.size())));
}
```

The result step is built once the stream is over, so whatever the work set on the wizard while it ran (here, the status of each procedure) is on the result screen. Streamed completions are Java-only: the .NET and Python ports have no `LongTask`.

The wizard **title** is derived in order: `TitleSupplier.title()` → `@Title` annotation → class name (the dynamic supplier wins over the static annotation).

![Registration wizard — step 1 with progress bar and Next button](/images/docs/ux-patterns/wizard.png)

## Branching — conditional steps

Override `stepApplies(String stepFieldName)` to skip steps based on the answers so far. A skipped step is jumped over in **both** directions (Next and Back), excluded from the progress bar, and left out of the accordion / previous-answers recap in the other layout modes. The result step always applies.

```java
public class SignupWizard extends Wizard {

    AccountTypeStep account = new AccountTypeStep();   // asks PERSONAL / COMPANY
    CompanyDetailsStep company = new CompanyDetailsStep();
    PlanStep plan = new PlanStep();
    ResultStep result;

    @Override
    protected boolean stepApplies(String stepFieldName) {
        if ("company".equals(stepFieldName)) {
            return account.accountType == AccountType.COMPANY;   // skip for personal accounts
        }
        return true;
    }

    @WizardCompletionAction
    @Action(validationRequired = true)
    Object finish() { /* … */ return null; }
}
```

`stepApplies` is evaluated on every render and navigation, so it can depend on values captured by any earlier step. When the skipped step was the penultimate one, the completion button moves to the last applicable step automatically.

## Layout modes — `@WizardLayout`

By default a wizard shows one step at a time. Annotate the class with `@WizardLayout(...)` to change
how it's laid out:

```java
@WizardLayout(WizardLayoutMode.ACCUMULATIVE)
public class OnboardingWizard extends Wizard { … }
```

| Mode | Behaviour |
|---|---|
| `STEPS` *(default)* | Only the current step is shown, one at a time. |
| `ACCUMULATIVE` | The current step is editable, with a single compact **"Previous answers" recap card** above it — every completed step's values listed as dense `label: value` lines, grouped by step — so the user always sees what has been collected so far without it dominating the screen. |
| `ACCORDION` | Every step is a **collapsible panel**: the current one is open and editable, completed ones are collapsed (expand to review), upcoming ones are disabled. As you advance, the previous panel collapses and the next opens. |

<div style="display:flex; gap:1rem; flex-wrap:wrap;">
  <figure style="flex:1; min-width:280px; margin:0;">
    <img src="/images/docs/ux-patterns/wizard-accumulative.png" alt="Accumulative wizard — completed steps recapped above the current one" />
    <figcaption><code>ACCUMULATIVE</code></figcaption>
  </figure>
  <figure style="flex:1; min-width:280px; margin:0;">
    <img src="/images/docs/ux-patterns/wizard-accordion.png" alt="Accordion wizard — one collapsible panel per step" />
    <figcaption><code>ACCORDION</code></figcaption>
  </figure>
</div>

Both non-default modes render previously entered data read-only; steps should use distinct field
names (the wizard state is a single flat map across steps).

## Drafts, skipping and finishing early (the transactional guided process)

Four affordances turn a wizard into a process the user can leave and come back to — the
transactional half of the Redwood guided process. All of them are ordinary buttons composed on the
server, so every renderer draws them with its own widgets.

```java
@UI("/onboarding")
@WizardProgress(WizardProgressStyle.STEPS)
public class Onboarding extends Wizard implements Draftable {
  Contact contact = new Contact();
  Preferences preferences = new Preferences();
  Extras extras = new Extras();
  Done done;

  // Draftable: "Save" and "Save and close" on every step
  @Override public Object saveDraft(HttpRequest rq) { drafts.save(this); return null; }
  @Override public Object closeDraft(HttpRequest rq) { return URI.create("/home"); }
  @Override public String resumeStep(HttpRequest rq) { return drafts.lastStepOf(rq); }

  // "Skip" on the optional steps
  @Override protected boolean stepSkippable(String step) { return "preferences".equals(step); }

  // cancelable hook before ANY move: null lets it happen, anything else is the answer
  @Override protected Object beforeStepNavigate(String from, String to, HttpRequest rq) {
    return "contact".equals(from) && contact.email.endsWith("@blocked.test")
        ? Message.error("That e-mail domain is not allowed") : null;
  }

  // offered beside Next from the preferences step on
  @WizardCompletionAction(availableFromStep = "preferences")
  @Label("Finish now")
  Object finish() { ... }
}
```

| Piece | What it does |
|---|---|
| `Draftable.saveDraft(rq)` | "Save": the current step is hydrated but **not validated** (a draft may be incomplete); `null` answers "Draft saved" and the wizard stays put |
| `Draftable.closeDraft(rq)` | where "Save and close" lands after saving (a `URI` or a `UICommand`; `null` = `/`); the page is marked clean first |
| `Draftable.resumeStep(rq)` | the step (field name) a fresh load opens on — the one the user left |
| `stepSkippable(step)` | "Skip": moves on without requiring that step's fields. Unlike `stepApplies`, the step is still there — the user chose to leave it for later |
| `@WizardCompletionAction(availableFromStep = "…")` | the completion is offered beside Next from that step on |
| `beforeStepNavigate(from, to, rq)` | runs before Next, Back, Skip, a jump to a visited step and the completion (whose `to` is the result step), after the step is hydrated and — going forward — its required fields checked. Return `null` to proceed; anything else cancels the move and is the response |

### Display options (`WizardDisplay`)

Every built-in affordance of the wizard can be switched with the shared tri-state `Toggle`
(`on` · `off` · `disabled` = shown but inert, which is what permissions need):

```java
@Override protected WizardDisplay display() {
  return WizardDisplay.defaults().toBuilder()
      .saveDraft(canWrite ? Toggle.on : Toggle.disabled)
      .saveAndClose(Toggle.off)
      .build();
}
```

`saveDraft`, `saveAndClose` and `skip` default to `on` (each shows only where the wizard supports
it). A `disabled` affordance is refused on the server too, not just greyed out.

## Structure

```
Account setup                         ← getTitle()
[●────────────────────] Step 1 / 3   ← progress bar

  Account type: ○ Personal  ● Business

                            [Next →]
```

```
Account setup
[────●────────────────] Step 2 / 3

  Company name: ___________
  VAT number:   ___________

  [← Back]            [Create account]   ← @WizardCompletionAction
```

```
Account setup
[──────────────────────●] Done

  ✓ Account created successfully.
                                         ← no navigation buttons
```

## The Redwood guided process

The Redwood **Guided Process** template turns a complex job into a short list of named steps, so the
user always sees how far along they are, what is left, and can come back to it later. In Mateu it is a
`Wizard` annotated `@WizardProgress(WizardProgressStyle.RAIL)`; the Redwood renderer paints it with
Redwood's own guided-process component (`oj-sp-guided-process`), the other renderers with the step
form beside a sticky rail.

![A guided process on Redwood: the step form on the left, the steps and the n | total counter on the right, Cancel and Continue in the footer](/images/docs/redwood-templates/guided-process-1.png)

### When to use it

- A **complex, infrequent** task — a set-up, an onboarding, a transfer — of **2 to 25 steps**, done
  in order or not, by one person or handed between several, possibly over several sessions.
- Steps that **depend on earlier answers** (some appear or disappear) — `stepApplies`.
- Long processes the user should be able to **save and resume** — `Draftable`.

Pick something else when the process is two or three short steps (a
[guided process drawer](/ux-patterns/drawer/#guided-process-drawer-a-wizard-in-a-drawer-embeddedview)),
when it is really one form (the [advanced create & edit](/ux-patterns/advanced-create-and-edit/) page or
a [create-and-edit drawer](/ux-patterns/drawer/#crud-editing-in-a-drawer-editindrawer)), or when the
user faces a list of independent tasks submitted one by one (a [to-do list](/ux-patterns/to-do-list/)).

When designing the steps: one decision or action per step, related steps grouped in order, data
dependencies respected, and fields that condition each other kept in the same step. Past ten steps,
consider fewer, bigger steps.

### Anatomy

A guided process has up to three kinds of page:

| Page / region | What it holds | Mateu piece |
|---|---|---|
| **Overview** (Redwood only) | the process title and subtitle over the steps laid out side by side; *Start*, or *Resume* when the process is under way | `@Title` / `TitleSupplier`, `@Subtitle` / `SubtitleSupplier`, the step fields |
| **Step page — title** | the process title and the current step's title | `@Title`; the step field's `@Label` (else its humanised name) |
| **Step page — body** | the forms, tables and other content needed for the step | the step class: its fields, `@Section`s, grids, its own `@Toolbar` buttons |
| **Step page — table of contents** | the steps, the current one marked, the `n \| total` counter | built from the applicable steps (`stepApplies`) |
| **Step page — footer** | *Cancel*, *Continue*, the completion action on the last step; optionally *Skip*, *Save*, *Save and close* | `next`, `@WizardCompletionAction` (+ its `@Label`), `stepSkippable`, `Draftable` |
| **Completion panel** | what the user sees once the process is done | the last step field — the result screen |

![The overview: process title and subtitle over the steps, with Start](/images/docs/redwood-templates/guided-process-2.png)

### Responsive behaviour

On Redwood the component does it: on wide screens the overview lays the steps out side by side and
the step page shows the table of contents expanded on the right; on narrow screens the overview
stacks the steps and the table of contents folds behind the `n | total` page number, opening over
the content. Mateu's extra footer buttons (*Skip*, *Save*, *Save and close*) are a row in the step
body that wraps. On the other renderers the rail is a sticky right-hand column beside the step form.

![The step page at phone width: the table of contents behind the page number](/images/docs/redwood-templates/guided-process-3.png)

### What you can configure

**Legend:** ✅ the Redwood renderer paints it · 🟡 partly / differently · ❌ not available on Redwood.

| Element | Mateu piece | Redwood | Note |
|---|---|---|---|
| Process title / subtitle | `@Title` / `@Subtitle` (or their suppliers) | ✅ | |
| Step titles | step field `@Label` | ✅ | |
| Step subtitle (description) | — | ❌ | |
| Step status | done / current / upcoming | 🟡 | done steps are marked completed; no *error* or *warning* status |
| Overview (interactive, non-interactive, off) | — | 🟡 | always the component's default overview |
| Branching steps | `stepApplies(step)` | ✅ | the table of contents follows |
| Jump to a step from the table of contents | done steps only | 🟡 | going back works; forward you advance with *Continue* |
| Continue / Cancel | built in | ✅ | *Cancel* returns to the app's home page |
| Completion action and its label | `@WizardCompletionAction` + `@Label` | ✅ | |
| Completion offered before the last step | `@WizardCompletionAction(availableFromStep = "…")` | ❌ | not wired to the component yet |
| Skip optional steps | `stepSkippable(step)` | 🟡 | a Mateu button in the step body |
| Save draft / Save and close / resume | `Draftable` | 🟡 | the buttons are Mateu's, in the step body; resuming opens on the right step ✅ |
| Switch an affordance off or make it inert | `display()` → `WizardDisplay` (`Toggle`) | ✅ | |
| Validate before moving / veto a move | required-field checks, `beforeStepNavigate(from, to, rq)` | ✅ | |
| Timestamp, avatar, checklist | — | ❌ | |
| Completion panel | the result step | 🟡 | shown as the process's last screen; no *start again* / *back* actions |
| Page width (edge to edge) | `@PageWidth(PageWidthStyle.EDGE_TO_EDGE)` | 🟡 | not the default — declare it |

### Building it with Mateu

```java
public class SupplierStep implements WizardStep {
  @NotEmpty String businessName;
  String taxId;
}

public class ContactsStep implements WizardStep {
  @Email String email;
  String phone;
}

public class BankStep implements WizardStep {
  String iban;
}

public class SupplierCreated implements WizardStep {
  @PlainText String summary = "The supplier has been registered.";
}

@UI("/suppliers/new")
@Title("New supplier")
@Subtitle("Register a supplier in three steps")
@WizardProgress(WizardProgressStyle.RAIL)
@PageWidth(PageWidthStyle.EDGE_TO_EDGE)
public class NewSupplier extends Wizard implements Draftable {

  @Label("General information") SupplierStep general = new SupplierStep();
  @Label("Contacts")            ContactsStep contacts = new ContactsStep();
  @Label("Bank details")        BankStep bank = new BankStep();
  @Label("Supplier registered") SupplierCreated done;     // the completion panel

  @Override protected boolean stepSkippable(String step) { return "contacts".equals(step); }

  @Override public Object saveDraft(HttpRequest rq) { return null; }      // "Draft saved"
  @Override public String resumeStep(HttpRequest rq) { return null; }     // start from the first step

  @WizardCompletionAction
  @Label("Create")
  Object create() { return null; }                                        // null → the result step
}
```

### Known gaps

On the Redwood renderer (details and code references in [guided-process review](https://github.com/miguelperezcolom/mateu/blob/master/design/redwood-templates/guided-process.md)
in the repository):

- *Skip*, *Save* and *Save and close* are Mateu buttons in the step body, not the component's own
  footer actions;
- `@WizardCompletionAction(availableFromStep)` is not passed to the component, and the early
  completion button may be lost or Next shown twice;
- the page is fixed-width unless you declare edge to edge, which is the only width Redwood allows;
- *Cancel* goes to the home page with no server hook;
- no step subtitle, no error/warning step status, no checklist, timestamp or avatar; the overview
  mode is not configurable; the browser's back button does not step back;
- the demos (`/booking` in the Redwood showcase, `/end-of-day` in the PMS demo) do not exercise drafts,
  skipping or early completion.

## Redwood parameter and slot reference

What the Redwood `guided-process` template exposes, and what Mateu gives you for it. The gaps here
are **the transactional ones** — drafts, resuming and skipping — which is the largest coherent piece
of Redwood surface Mateu does not cover. The canonical page-header elements shared by every template
are documented once in [Page templates](/ux-patterns/page-templates/).

**Legend:** ✅ supported · 🟡 partial · — not supported · ⚪ deliberately out of scope

| Redwood prop / slot | Mateu | |
|---|---|---|
| `processTitle` / `processSubtitle` | `getTitle()` / `@Title`, `@Subtitle` / `SubtitleSupplier` | ✅ |
| `steps[]` / `currentStep` | step fields; `numberOfSteps()`, `currentStepNumber()`, `getStep()` | ✅ |
| `displayOptions.checklistDisplay: current \| all` | `@WizardProgress(BAR \| STEPS \| RAIL)` picks the progress presentation | ✅ |
| Conditional steps | `stepApplies(stepFieldName)` — branching | ✅ |
| Completion step | **Slot** `completionStep` ↔ `@WizardCompletionAction` + the done state | ✅ |
| Validation before advancing | `validations()` runs before the step advances | ✅ |
| `avatar` + `displayOptions.avatar` | `PageDto.avatar/icon` on the canonical header | 🟡 |
| `primaryAction.availableFromStep` (enable the finish action from step N on) | `@WizardCompletionAction(availableFromStep = "…")` — not yet passed to the Redwood component | 🟡 |
| `resumeStepId` (resume where the user left off) | `Draftable.resumeStep(rq)` | ✅ |
| `displayOptions {save, saveAndClose}` + `spSave` / `spSaveAndClose` (drafts) | `Draftable.saveDraft` / `closeDraft` + `WizardDisplay.saveDraft` / `saveAndClose` — on Redwood they are Mateu buttons in the step body, not the component's footer actions | ✅ |
| `spSkip {skippedStepId}` (user-initiated skip) | `stepSkippable(step)` + `WizardDisplay.skip` — a Mateu button on Redwood | ✅ |
| `spBeforeNext` / `spBeforeStepNavigate` (cancelable hooks) | `beforeStepNavigate(from, to, rq)` | ✅ |
| `completionStatus` / `continueWorkingStatus` | the done state is terminal | 🟡 |
| `displayOptions.overviewAnimation` | — | — |
| `displayOptions.density: standard \| compact` | `@Compact`, set on the view rather than as a template option | 🟡 |
| **Slot** `announcement` (aria-live) | return `UICommand.announce(text)` / `announceAssertive(text)` from any action | ✅ |

The related `step-by-step-page` template (a full-screen linear process) adds `timer {startTime,
timeInterval}` for timed processes and `spFinishLater`; neither is built. For a wizard inside a
drawer, see [Guided Process Drawer](/ux-patterns/drawer/#guided-process-drawer-a-wizard-in-a-drawer-embeddedview).

## Coverage

| | Java | .NET | Python | Vaadin | Redwood | React Native | IntelliJ |
|---|---|---|---|---|---|---|---|
| Steps, branching, progress (BAR / STEPS / RAIL) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Drafts (`Draftable`: save, save and close, resume) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Skip (`stepSkippable`) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Early completion (`availableFromStep`) | ✅ | 🟡 ¹ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `beforeStepNavigate` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `WizardDisplay` toggles | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

The renderer columns need no wizard-specific code: every affordance is a button composed on the
server. ¹ The .NET and Python wizards number their steps (`[Step(n)]`), so the hooks take step
numbers instead of field names, and .NET's early completion is the fixed `complete` action.

## Principles served

- **Progressive complexity** — each step shows only what is needed at that moment
- **Recoverability** — validation fires before advancing, not at the end
- **Workflow over screens** — the wizard models a task, not an entity
