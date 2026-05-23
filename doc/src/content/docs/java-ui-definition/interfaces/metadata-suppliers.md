---
title: "Metadata supplier interfaces"
---

These lightweight interfaces let you provide page metadata (title, subtitle, browser title) dynamically at runtime instead of hardcoding them with annotations.

---

# TitleSupplier

Provides the page title dynamically.

```java
public interface TitleSupplier {
    String title();
}
```

## Usage

```java
@Route("/customers/{id}")
public class CustomerDetailPage implements ComponentTreeSupplier, TitleSupplier {

    private final CustomerRepository repo;

    @Override
    public Component component(HttpRequest httpRequest) {
        var id = httpRequest.lastPathItem();
        return Form.builder().title(title()).build();
    }

    @Override
    public String title() {
        return "Customer detail";
    }
}
```

---

# SubtitleSupplier

Provides the page subtitle dynamically.

```java
public interface SubtitleSupplier {
    String subtitle();
}
```

## Usage

```java
@Route("/report")
public class ReportPage implements ComponentTreeSupplier, SubtitleSupplier {

    @Override
    public Component component(HttpRequest httpRequest) {
        return Form.builder().title("Report").subtitle(subtitle()).build();
    }

    @Override
    public String subtitle() {
        return "Generated on " + LocalDate.now();
    }
}
```

---

# ValidationSupplier

Provides cross-field validations programmatically — an alternative to the `@Validation` annotation for dynamic validation logic.

```java
public interface ValidationSupplier {
    List<Validation> validations();
}
```

## Usage

```java
public class BookingForm implements ValidationSupplier {
    LocalDate startDate;
    LocalDate endDate;

    @Override
    public List<Validation> validations() {
        return List.of(
            new Validation("startDate > endDate", "endDate", "End date must be after start date")
        );
    }
}
```

---

# RuleSupplier

Provides conditional UI rules programmatically — an alternative to the `@Rule` annotation.

```java
public interface RuleSupplier {
    List<Rule> rules();
}
```

## Usage

```java
public class AccountForm implements RuleSupplier {
    String accountType;
    String vatNumber;

    @Override
    public List<Rule> rules() {
        return List.of(
            Rule.builder()
                .filter("accountType == 'BUSINESS'")
                .action(RuleAction.set)
                .fieldName("vatNumber")
                .fieldAttribute(RuleFieldAttribute.visible)
                .value("true")
                .build()
        );
    }
}
```

---

# DataSupplier

Provides arbitrary data to the component on each render cycle.

```java
public interface DataSupplier {
    Object data(HttpRequest httpRequest);
}
```

## Usage

```java
@Route("/summary")
public class SummaryPage implements ComponentTreeSupplier, DataSupplier {

    @Override
    public Component component(HttpRequest httpRequest) {
        return Form.builder().title("Summary").build();
    }

    @Override
    public Object data(HttpRequest httpRequest) {
        return Map.of("totalRevenue", revenueService.getTotal());
    }
}
```

---

# CommandSupplier

Provides a list of `UICommand` objects that the client executes after rendering.

```java
public interface CommandSupplier {
    List<UICommand> commands(HttpRequest httpRequest);
}
```

## Usage

```java
@Route("/setup")
public class SetupPage implements ComponentTreeSupplier, CommandSupplier {

    @Override
    public Component component(HttpRequest httpRequest) {
        return new Text("Setting up...");
    }

    @Override
    public List<UICommand> commands(HttpRequest httpRequest) {
        return List.of(new UICommand("navigate", "/dashboard"));
    }
}
```

---

# PostHydrationHandler

Called by Mateu after it re-hydrates the component state from the client. Use it to perform side effects or load data after the state has been populated.

```java
public interface PostHydrationHandler {
    void onHydrated(HttpRequest httpRequest);
}
```

## Usage

```java
public class OrderForm implements PostHydrationHandler {
    String orderId;
    String status;

    @Override
    public void onHydrated(HttpRequest httpRequest) {
        // called after orderId/status have been populated from the client state
        auditService.log("Order form loaded: " + orderId);
    }
}
```
