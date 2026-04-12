---
title: "Testing"
weight: 6
aliases:
  - /java-user-manual/testing/
---

# Testing

Mateu ViewModels are plain Java objects.

## Unit testing

```java
@Test
void increment() {
  Home h = new Home();
  h.increment.run();
  assertEquals(1, h.count);
}
```

## Testing routing

Test hydration and parameters via mocks of HttpRequest.

## Guideline

Test:

- actions
- business logic
- state transitions
