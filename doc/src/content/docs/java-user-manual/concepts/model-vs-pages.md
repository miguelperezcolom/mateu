---
title: "Model vs Pages"
---

Most Mateu UIs should be defined at the model level. Explicit `@Route` pages are the exception, not the default.

---

## The principle

When the framework can infer what the user needs from the model, there is no reason to write a separate page class. The model becomes the single source of truth for both data and UI.

---

## Example: relationships in the model

Instead of creating a separate editor page for a related entity:

```java
// Not recommended for standard relationships
@Route("/products/:id/categories/edit")
public class ProductCategoryEditor {
    // lots of wiring...
}
```

Express the relationship directly in the model with an annotation:

```java
@Lookup(search = CategoryOptionsSupplier.class, label = CategoryLabelSupplier.class)
List<String> categories;
```

From this single annotation, Mateu generates:

- a selection UI (dropdown, checkbox list, or similar)
- label resolution from IDs
- integration with the CRUD form
- persistence integration

---

## Example: status field

Instead of a custom page to change a product's status:

```java
@Stereotype(FieldStereotype.radio)
Status status;
```

Mateu renders the radio group in the existing form. No extra page needed.

---

## When NOT to create a page

You usually do not need a `@Route` page when:

- you are doing standard CRUD
- the UI can be inferred from the model type and annotations
- relationships can be expressed with `@Lookup` or similar
- actions fit naturally as `@Button` or `@Toolbar` methods on the existing form

---

## When to create a page

Create an explicit `@Route` class when:

- you need a multi-step wizard or guided flow
- you need a custom dashboard or composite layout
- the behavior genuinely cannot be expressed declaratively
- you need a standalone URL for deep linking or sharing

```java
@Route("/products/onboarding")
public class ProductOnboardingWizard {

    // Step 1
    String name;
    Status status;

    // Step 2
    String description;
    int initialStock;

    // Step 3
    List<String> categories;

    @Button
    @Action(validationRequired = true)
    public URI finish() {
        String id = productRepository.create(name, status, description, initialStock, categories);
        return URI.create("/products/" + id);
    }

}
```

---

## Mental model

- model = source of truth for data and default UI
- annotations = UI intent and behavior
- `@Route` page = escape hatch for custom flows

Push as much as possible into the model. Reach for explicit pages only when the model cannot express the required behavior.

---

## Next

- [State, actions and fields](/java-user-manual/concepts/state-actions-and-fields/)
- [Field stereotypes](/java-user-manual/concepts/field-stereotypes/)
- [Routing and parameters](/java-user-manual/concepts/routing-and-parameters/)
