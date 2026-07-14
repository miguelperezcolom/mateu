---
title: File list
description: A list of attachments with type icons, sizes and download links.
---

**Status:** ✅ Implemented

## Intent

Show a set of attached files — a ticket's attachments, a record's documents, an export bundle — as a compact list with a type icon, name, size and a download/open action.

## Solution

Use the `FileList` component: a list of `FileItem`s (name, size label, type, and a `url` and/or `actionId`). The `type` (e.g. `"pdf"`, `"image"`, `"excel"`, `"zip"`, `"video"`) picks the icon. A file with a `url` renders as a download link; one with an `actionId` dispatches the standard `action-requested` event (e.g. to preview it).

```java
@Section("Files")
Component files = FileList.builder()
        .files(List.of(
                FileItem.builder().name("Q3-report.pdf").size("2.4 MB").type("pdf").url("/dl/q3").build(),
                FileItem.builder().name("brand-logo.png").size("120 KB").type("image").url("/dl/logo").build(),
                FileItem.builder().name("demo.mp4").size("64 MB").type("video").actionId("preview").build()))
        .build();
```

![Attachments](/images/docs/file-list/attachments.png)

The renderer is dependency-free, themes through the standard CSS variables and works in dark mode.

## When to use it

Use a `FileList` to **display attachments**. To let the user *add* files, pair it with the chat's upload button or an `@UploadableImage`/file field. Demo: `/filelist-demo`.
