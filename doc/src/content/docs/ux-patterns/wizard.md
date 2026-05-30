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

Model each step as a separate view. The advance action validates the current step and returns the next. `@WizardCompletionAction` marks the final step's closing action. Intermediate validation is enforced with `@Action(validationRequired = true)`.

```java
@UI("/onboarding/step1")
public class OnboardingStep1 {

    private AccountType accountType;

    @WizardCompletionAction
    @Action(validationRequired = true)
    public OnboardingStep2 next() {
        return new OnboardingStep2(accountType);
    }
}

@UI("/onboarding/step2")
public class OnboardingStep2 {

    private final AccountType accountType;

    // fields relevant to accountType only
    private String companyName; // shown only for BUSINESS

    @WizardCompletionAction
    @Action(validationRequired = true)
    public OnboardingStep3 next() {
        return new OnboardingStep3(/* ... */);
    }
}
```

## Structure

```
Step 1 of 3 ──●────────────────────
  Account type: ○ Personal  ● Business
  
                            [Next →]
```

```
Step 2 of 3 ────●──────────────────
  Company name: ___________
  
  [← Back]                 [Next →]
```

## Principles served

- **Progressive complexity** — each step shows only what is needed at that moment
- **Recoverability** — validation fires before advancing, not at the end
- **Workflow over screens** — the wizard models a task, not an entity
