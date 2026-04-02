---
title: "AI"
weight: 14
---

# AI

Mateu is being extended with first-class AI support in two directions: **making it easier for LLMs to generate Mateu code**, and **enabling AI agents to drive Mateu UIs at runtime**.

---

## LLM-friendly code generation

Mateu's declarative model is well-suited for code generation. A well-prompted LLM can produce a working Mateu class — fields, actions, navigation — from a natural language description of a screen.

To make this reliable, we are publishing:

- a compact reference of Mateu annotations and patterns optimized for LLM context windows
- example prompts for generating CRUD screens, forms, and workflows
- a prompt library for common use cases

*Documentation coming soon.*

---

## MCP server

We are building a [Model Context Protocol](https://modelcontextprotocol.io) server for Mateu that will allow AI agents to:

- navigate Mateu applications
- read and interact with forms
- trigger actions
- compose workflows across multiple screens

This enables AI-driven automation of any Mateu-based application without custom integration work.

*In development.*

---

## Follow progress

Watch the [GitHub repo](https://github.com/miguelperezcolom/mateu) for updates on both features.
