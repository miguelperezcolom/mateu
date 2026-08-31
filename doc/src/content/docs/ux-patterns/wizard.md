---
title: Wizard
description: Guide sequential flows with inter-step dependencies.
---

**Status:** ✅ Implemented

## Intent

Guide sequential flows where each step depends on what was chosen in earlier steps.

## Problem

An onboarding flow where step 3 depends on what was selected in step 1 cannot be safely collapsed into one large form — the user could advance without completing required choices, or see irrelevant fields. Jumping between pages with no intermediate validation breaks the flow.

## Solution

Extend `Wizard` and declare one field per step; each field's type must implement `WizardStep`. Mateu renders the current step's form, a progress indicator, and navigation buttons automatically. The progress indicator is a bar by default; annotate the wizard with `@WizardProgress(WizardProgressStyle.STEPS)` to show connected step bullets instead (one numbered dot per applicable step with done/current/upcoming states — skipped branching steps are excluded, and every dot shows done on the result screen), or `@WizardProgress(WizardProgressStyle.RAIL)` for the guided-process lateral rail: the step form on the left and a sticky right-hand band with a big `current | total` counter over the vertical step list (demo: `/branching-wizard`). State set in **any** step — by the user or by an action — survives navigation in both directions and reaches the completion action, so steps can freely read what earlier (or later) steps produced.

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

The last step is instantiated automatically with its default field values if it is `null` when `@WizardCompletionAction` returns — or the wizard can set it explicitly inside the completion method.

The wizard **title** is derived in order: `@Title` annotation → `TitleSupplier.title()` → class name.

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

## Redwood parameter and slot reference

What the Redwood `guided-process` template exposes, and what Mateu gives you for it. The gaps here
are **the transactional ones** — drafts, resuming and skipping — which is the largest coherent piece
of Redwood surface Mateu does not cover. The canonical page-header elements shared by every template
are documented once in [Page templates](/ux-patterns/page-templates/).

**Legend:** ✅ supported · 🟡 partial · — not supported · ⚪ deliberately out of scope

| Redwood prop / slot | Mateu | |
|---|---|---|
| `processTitle` / `processSubtitle` | `getTitle()` / `@Title` | ✅ |
| `steps[]` / `currentStep` | step fields; `numberOfSteps()`, `currentStepNumber()`, `getStep()` | ✅ |
| `displayOptions.checklistDisplay: current \| all` | `@WizardProgress(BAR \| STEPS \| RAIL)` picks the progress presentation | ✅ |
| Conditional steps | `stepApplies(stepFieldName)` — branching | ✅ |
| Completion step | **Slot** `completionStep` ↔ `@WizardCompletionAction` + the done state | ✅ |
| Validation before advancing | `validations()` runs before the step advances | ✅ |
| `avatar` + `displayOptions.avatar` | `PageDto.avatar/icon` on the canonical header | 🟡 |
| `primaryAction.availableFromStep` (enable the finish action from step N on) | — | — |
| `resumeStepId` (resume where the user left off) | — | — |
| `displayOptions {save, saveAndClose}` + `spSave` / `spSaveAndClose` (drafts) | — there is no draft concept; the wizard state lives in the page state for the duration of the flow | — |
| `spSkip {skippedStepId}` (user-initiated skip) | `stepApplies` skips a step by rule, but the user cannot skip one | 🟡 |
| `spBeforeNext` / `spBeforeStepNavigate` (cancelable hooks) | validation runs, but there is no declarative cancelable hook — do it inside the action | 🟡 |
| `completionStatus` / `continueWorkingStatus` | the done state is terminal | 🟡 |
| `displayOptions.overviewAnimation` | — | — |
| `displayOptions.density: standard \| compact` | `@Compact`, set on the view rather than as a template option | 🟡 |
| **Slot** `announcement` (aria-live) | live regions are installed client-side for a11y, but the backend cannot declare announcement content | 🟡 |

The related `step-by-step-page` template (a full-screen linear process) adds `timer {startTime,
timeInterval}` for timed processes and `spFinishLater`; neither is built. For a wizard inside a
drawer, see [Guided Process Drawer](/ux-patterns/drawer/#guided-process-drawer-a-wizard-in-a-drawer-embeddedview).

## Principles served

- **Progressive complexity** — each step shows only what is needed at that moment
- **Recoverability** — validation fires before advancing, not at the end
- **Workflow over screens** — the wizard models a task, not an entity
