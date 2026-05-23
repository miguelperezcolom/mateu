---
title: "Avatar / AvatarGroup"
---

Displays a user avatar — either as an image or as initials derived from the name.

## Basic usage

```java
// Name-based (shows initials)
new Avatar("Mateu Pérez")

// With image
Avatar.builder()
    .name("Mateu Pérez")
    .image("/images/mateu.png")
    .build()
```

## Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `name` | String | — | User's name — used to generate initials when no image is provided |
| `abbreviation` | String | `""` | Custom initials override |
| `image` | String | `""` | Image URL or data URI |
| `style` | String | `""` | Inline CSS |
| `cssClasses` | String | `""` | CSS class names |

## Examples

```java
// Initials only
Avatar.builder().name("Miguel Pérez").build()

// Custom abbreviation
Avatar.builder().name("Miguel Pérez").abbreviation("MP").build()

// Image avatar
Avatar.builder()
    .name("Antònia Galmés")
    .image("https://example.com/users/antonia.jpg")
    .build()
```

---

# AvatarGroup

Stacks multiple avatars with a visible overlap. Shows a "+N" overflow indicator when there are more avatars than the `maxItems` limit.

## Basic usage

```java
new AvatarGroup(List.of(
    Avatar.builder().name("Mateu Pérez").build(),
    Avatar.builder().name("Antònia Galmés").build(),
    Avatar.builder().name("Miguel Pérez").build()
), 2)
```

## Properties

| Property | Type | Description |
|---|---|---|
| `items` | `List<Avatar>` | Avatars to display |
| `maxItems` | int | Maximum avatars shown before the overflow indicator |

## Example with overflow

```java
new AvatarGroup(teamMembers.stream()
    .map(m -> Avatar.builder().name(m.getName()).image(m.getPhotoUrl()).build())
    .toList(),
    4   // show at most 4, then "+N"
)
```
