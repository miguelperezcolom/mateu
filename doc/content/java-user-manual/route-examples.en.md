---
title: "Route examples"
weight: 16
---

# Route examples

## Explicit

```java
@Route("/users/:id")
```

## Implicit

```java
@Menu
Users users;
```

## Nested

```java
@Route(value="/orders/create", parentRoute="/orders")
```

## Query params

```
/users/1?version=2
```
