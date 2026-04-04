# Mateu Routing Model — Spec

## Purpose

The Mateu routing model defines how a request URL is resolved to a ViewModel inside an exposed UI.

Goals:
- Declarative routing
- No external route config
- Structure-first
- Support nested views
- Automatic parameter binding
- Compatible with menus, slots, and microservices

---

## 1. UI Context (`@UI`)

`@UI` exposes a root application and defines the base route.

```java
@UI("/admin")
public class AdminApp {}
```

All routes are resolved relative to this base.

---

## 2. Routes (`@Route`)

Defines explicit routes relative to a UI.

```java
@Route("/users")
public class UsersPage {}
```

Effective route:

```
/admin/users
```

---

## 3. Implicit Routes (`@Menu`)

Menu fields create route segments.

```java
@Menu
UsersCrud users;
```

→ `/users`

---

## 4. Route Sources

- Explicit → `@Route`
- Implicit → `@Menu`

---

## 5. Precedence

1. Explicit routes
2. Implicit routes  
3. Longest / most specific wins

---

## 6. Parameters

### Path params
```java
@Route("/users/:id")
String id;
```

### Query params
```
/users/123?version=5
```

→ `version = 5`

### Rules
- Name-based binding
- Path > Query precedence
- Ignore unknown params

---

## 7. Hydration (`Hydratable`)

```java
public interface Hydratable {
  void hydrate(HttpRequest httpRequest);
}
```

Lifecycle:
1. Instantiate
2. Bind params
3. hydrate()
4. Ready

---

## 8. Nested Routes (`parentRoute`)

```java
@Route(value="/orders/create", parentRoute="/orders")
```

Eligible only if:
- Parent route resolved
- Parent has slot
- Matches pattern

Supports params / regex.

---

## 9. Effective Route

```
UI base + route
```

Implicit:
```
UI base + menu path
```

---

## 10. Resolution Algorithm

1. Resolve UI
2. Build candidates
3. Filter by parentRoute
4. Apply precedence
5. Bind params
6. hydrate()
7. Render

---

## 11. Mental Model

```
URL → UI → Route → Fields → Hydrate → UI
```

---

## 12. Summary

Mateu routing is:
- Contextual (UI-based)
- Declarative
- Structure-first
- Explicit when needed
- Nested when required
- State-aware
