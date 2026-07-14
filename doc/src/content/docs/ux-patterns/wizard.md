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

Extend `Wizard` and declare one field per step; each field's type must implement `WizardStep`. Mateu renders the current step's form, a progress bar, and navigation buttons automatically. State set in **any** step — by the user or by an action — survives navigation in both directions and reaches the completion action, so steps can freely read what earlier (or later) steps produced.

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

## Principles served

- **Progressive complexity** — each step shows only what is needed at that moment
- **Recoverability** — validation fires before advancing, not at the end
- **Workflow over screens** — the wizard models a task, not an entity
