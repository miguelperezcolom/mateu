---
title: Comment thread
description: A discussion thread with nested replies — ticket comments, review threads, activity.
---

**Status:** ✅ Implemented

## Intent

Show a conversation — ticket comments, a review thread, an approval discussion — with its reply structure, so who-said-what-in-reply-to-what reads at a glance.

## Solution

Use the `CommentThread` component: a list of `Comment`s, each with an author, avatar, text, timestamp and nested `replies`. Replies are indented under their parent with a connecting rail; nesting is unlimited.

```java
@Section("Discussion")
Component thread = CommentThread.builder()
        .comments(List.of(
                Comment.builder().author("Ada Lovelace").avatar("👩‍💼").timestamp("2h ago")
                        .text("The export button throws a 500 for large datasets.")
                        .replies(List.of(
                                Comment.builder().author("Alan Turing").avatar("🧑‍💻").timestamp("1h ago")
                                        .text("Reproduced. It's a timeout on the streaming query.").build()))
                        .build()))
        .build();
```

![Ticket discussion](/images/docs/comment-thread/ticket.png)

The renderer is dependency-free, themes through the standard CSS variables and works in dark mode. `avatar` accepts an emoji or an image URL; with neither, the author's initial is shown.

## When to use it

Use `CommentThread` to **display a threaded discussion**. It is read-only; to post a comment, pair it with a form/`MessageInput` and re-render. For a flat chronological feed use `Timeline`. Demo: `/comments-demo`.
