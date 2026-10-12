---
title: Compare and merge records
description: Two (or more) records of the same type side by side, the differences highlighted, a pick per field — "use the value from A" or a typed one — and a merge action that receives the result.
---

**Status:** ✅ Implemented · `@Experimental`

![Two duplicate guest profiles side by side, the rows that differ highlighted](/images/docs/record-merge/merge.png)

## Intent

Some decisions are taken field by field over two versions of the same thing: merging **duplicate customer profiles**, resolving an **edit conflict** (your version against the stored one), reviewing what a **sync** is about to overwrite. A form with one radio per attribute works, but it reads like a form; the screen people know shows the records in **columns**, marks what differs and lets them pick a side for each row.

## Solution

Return a `RecordMerge` anywhere in the page's components: one `MergeRecord` per column, one `MergeField` per row with the row's value in each record (in the records' order), and the action that merges.

```java
RecordMerge.builder()
        .title("Guest profiles 1021 and 3388 look like the same person")
        .records(List.of(
                new MergeRecord("1021", "Profile 1021", "Created 3 Mar 2021 · 12 stays"),
                new MergeRecord("3388", "Profile 3388", "Created 9 Sep 2026 · 1 stay")))
        .fields(List.of(
                MergeField.of("lastName", "Last name", "García López", "Garcia"),
                MergeField.of("email", "Email", null, "ana.garcia@example.com"),
                MergeField.of("phone", "Phone", "+34 600 111 222", "+34 699 333 444").withEditable(true),
                MergeField.of("address", "Address", "C/ Mayor 1", "Calle Mayor 1, 07001 Palma")
                        .withEditable(true).withChosen("3388")))
        .mergeActionId("mergeProfiles")
        .mergeLabel("Merge into profile 1021")
        .parameters(Map.of("survivor", "1021", "duplicate", "3388"))
        .build()
```

The merge action receives the picks next to the component's own `parameters`:

| Parameter | Value |
|---|---|
| `_merged` | `fieldId → value`: the resulting record |
| `_choices` | `fieldId → record id` it was taken from, or `"custom"` when it was typed |

```java
public Object mergeProfiles(HttpRequest httpRequest) {
    var parameters = httpRequest.runActionRq().parameters();
    var merged = (Map<String, Object>) parameters.get("_merged");
    customers.merge((String) parameters.get("survivor"), (String) parameters.get("duplicate"), merged);
    return new Message("Profiles merged");
}
```

The server settles what every renderer would otherwise compute on its own: each row is padded (or cut) to one value per record, a row **differs** when its values are not all the same (compared as trimmed text; a missing value is blank), and the value picked to begin with is the one `withChosen` names or else the first record with a value. The picks themselves are client-side state — nothing reaches the server until the merge.

### Options

| Parameter | Effect |
|---|---|
| `records` | the columns, in order — two or more |
| `fields` | the rows; `MergeField.of(id, label, values…)`, `withChosen(recordId)`, `withEditable(true)` |
| `differencesOnly` | the **Show only differences** switch starts on |
| `mergeLabel` | the button's label (default **Merge**) |
| `parameters` | sent with the merge action, next to `_merged` / `_choices` |

## Accessibility

Each row is a native radio group, so it works with the keyboard as is: Tab moves between rows, the arrow keys pick within one. Every pick has a full name — **"Use value from Profile 3388 for Email"** — and a differing row says *differs* in text, not only in colour. The summary under the result ("7 fields: 5 differ; 1 typed by hand") is a polite live region.

## Where it works

- **Vaadin** — the shared `mateu-record-merge` element (a table, scrolling sideways when the records do not fit).
- **Redwood (Oracle VB)** — the RecordMerge atom on Redwood tokens.
- **React Native** — one card per field (columns do not fit a phone), the same picks and summary.
- **IntelliJ plugin** — a Swing grid with a button group per row.
- Also from the C# (`new RecordMerge { … }`) and Python (`RecordMerge(...)`) backends, and from YAML (`type: RecordMerge`).

Demo: `demo-admin-panel` → `/record-merge-demo` (also **F9**, or **MRG** in the command center).

## Related

- [Optimistic locking](/ux-patterns/optimistic-locking/) — when the conflict is detected
- [Comparison card](/ux-patterns/comparison-card/) — compare offers rather than records
