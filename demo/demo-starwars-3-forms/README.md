# Example 3 — rich forms: wizard, zones, tabs, field types

**Example 3** of the progressive Star Wars suite. Example 2 inferred a CRUD from one record; this one
stays declarative but reaches for **richer form UX** — still writing only information, letting Mateu
infer the widgets and the flow.

A tiny `@App` shell (`Home3`) puts two screens behind a menu:

## 1. A multi-step wizard — `RecruitWizard` (`/recruit`)

`extends Wizard`; each step is a class implementing `WizardStep`, declared as an ordered field:

```java
@UI("recruit") @Title("Recruit a character") @WizardProgress(WizardProgressStyle.STEPS)
public class RecruitWizard extends Wizard {
  IdentityStep identity;      // step 1
  TrainingStep training;      // step 2 — shows the completion button
  RecruitResult result;       // read-only result screen
  @WizardCompletionAction void recruit() { … build result … }
}
```

- **Step 1 is a two-column ZONED step**: `@Zones({@Zone("left","55%"), @Zone("right","45%")})` lays
  the *Identity* section beside the *Origin* section.
- **Step 2 shows field types**: a `@UseRadioButtons` enum (side), a `@Stereotype(stars)` rating, a
  `@Stereotype(toggle)` boolean, a `LocalDate` (date picker) and a `@Stereotype(money)` amount.
- The **penultimate** step carries the `@WizardCompletionAction` button; the **last** step is the
  read-only result. `STEPS` renders the progress as connected bullets.

## 2. A tabbed form — `Dossier` (`/dossier`)

Consecutive fields sharing a `@Tab` name form one tab; a `@Button` method shows a toast:

```java
@Tab("Bio")     @Stereotype(FieldStereotype.textarea) @Multiline String biography;
@Tab("Bio")     @Stereotype(FieldStereotype.stars)     int rating;
@Tab("Bio")     @Stereotype(FieldStereotype.toggle)    boolean fanFavorite;
@Tab("Service") LocalDate firstAppearance;              // date picker
@Tab("Service") @Stereotype(FieldStereotype.money)      double bounty;
@Tab("Service") @UseRadioButtons Allegiance allegiance; // radio group
@Button @Label("Save") Message save() { return new Message("Saved dossier for " + name); }
```

## The step from Example 2

Example 2 = one CRUD, all defaults. Example 3 = the same declarative style, now exercising the form
vocabulary a real app needs: multi-step flows, side-by-side zones, tabbed grouping and the field
stereotypes. Still no YAML, no hand-written layout — the annotations *are* the design. The next
example moves up to page archetypes and the app shell.

## Run it

```bash
cd demo/demo-starwars-3-forms
mvn -s ../../settings.xml spring-boot:run     # → http://localhost:8602
```

Open <http://localhost:8602> — the menu has **Recruit** (the wizard) and **Dossier** (the tabbed form).
