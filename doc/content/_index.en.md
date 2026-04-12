---
title: "Mateu"
description: "Build admin panels and business UIs in Java. No frontend required."
---

<div class="mateu-hero">
  <div class="mateu-container">
    <div class="mateu-grid mateu-grid-hero">
      <div>
        <p class="mateu-eyebrow">Java UI framework</p>
        <h1>Build admin panels in minutes.<br />No frontend required.</h1>
        <p class="mateu-lead">
          Define your UI in Java. Mateu generates forms, CRUD, navigation, validation and the application shell from a single model.
        </p>
        <div class="mateu-actions">
          <a href="/java-user-manual/getting-started/quickstart" class="mateu-btn mateu-btn-primary">Get started</a>
          <a href="/java-user-manual/use-cases/admin-panel" class="mateu-btn mateu-btn-secondary">View example</a>
        </div>
        <div class="mateu-checks">
          <span>✔ CRUD out of the box</span>
          <span>✔ Validation from your model</span>
          <span>✔ No duplicated logic</span>
        </div>
      </div>
      <div>
        <img src="/images/docs/admin-panel/products-list.jpeg" alt="Mateu admin panel product list" class="mateu-shot" />
      </div>
    </div>
  </div>
</div>

---

<div class="mateu-container">
  <div class="mateu-grid mateu-grid-4">
    <div class="mateu-card">
      <h3>One model</h3>
      <p>Define your UI once in Java.</p>
    </div>
    <div class="mateu-card">
      <h3>Generated UI</h3>
      <p>Forms, CRUD and navigation come for free.</p>
    </div>
    <div class="mateu-card">
      <h3>Less code</h3>
      <p>Fewer moving parts, less duplication, fewer bugs.</p>
    </div>
    <div class="mateu-card">
      <h3>Fits backend teams</h3>
      <p>Ideal for Java and Spring Boot teams.</p>
    </div>
  </div>
</div>

---

<div class="mateu-container mateu-section">
  <div class="mateu-grid mateu-grid-2">
    <div>
      <p class="mateu-eyebrow">Real example</p>
      <h2>A complete admin panel from a Java model</h2>
      <p class="mateu-text">
        This is the kind of UI Mateu is built for: backoffice screens, internal tools and CRUD-heavy business interfaces.
      </p>

```java
enum ProductStatus {
    Available, OutOfStock
}

record Product(
    @NotEmpty @EditableOnlyWhenCreating String id,
    @NotEmpty String name,
    @HiddenInList String description,
    @NotNull ProductStatus status
) implements Identifiable {}
```

      <p class="mateu-text">
        Add a repository and a UI class, and Mateu generates the rest.
      </p>
      <p>
        <a href="/java-user-manual/use-cases/admin-panel" class="mateu-link">
          See the full admin panel example →
        </a>
      </p>
    </div>
    <div>
      <img src="/images/docs/admin-panel/new-product-form-empty.png" alt="Mateu generated product form" class="mateu-shot mateu-shot-stack" />
      <img src="/images/docs/admin-panel/add-second-product-back-to-list.png" alt="Mateu product list after save" class="mateu-shot" />
    </div>
  </div>
</div>

---

<div class="mateu-container mateu-section">
  <p class="mateu-eyebrow">How it works</p>
  <h2>Three steps</h2>
  <div class="mateu-grid mateu-grid-3">
    <div class="mateu-card">
      <div class="mateu-step">01</div>
      <h3>Define your model</h3>
      <p>Use Java classes, fields, methods and annotations to describe state and behavior.</p>
    </div>
    <div class="mateu-card">
      <div class="mateu-step">02</div>
      <h3>Connect data</h3>
      <p>Attach a repository or adapter. Keep persistence and UI concerns cleanly separated.</p>
    </div>
    <div class="mateu-card">
      <div class="mateu-step">03</div>
      <h3>Run</h3>
      <p>Mateu generates forms, CRUD, validation, navigation and shell behavior automatically.</p>
    </div>
  </div>
</div>

---

<div class="mateu-container mateu-section">
  <p class="mateu-eyebrow">Best fit</p>
  <h2>Where Mateu shines</h2>
  <div class="mateu-grid mateu-grid-3">
    <div class="mateu-card">
      <h3>Admin panels</h3>
      <p>Build backoffice screens, management consoles and CRUD-heavy business UIs with maximum speed.</p>
    </div>
    <div class="mateu-card">
      <h3>Distributed UIs</h3>
      <p>Let each microservice define its own UI and compose everything into one shell.</p>
    </div>
    <div class="mateu-card">
      <h3>Embedded business UIs</h3>
      <p>Generate business interfaces that can be embedded inside apps built with React, Vue or other frameworks.</p>
    </div>
  </div>
</div>

---

<div class="mateu-container mateu-section">
  <div class="mateu-grid mateu-grid-2">
    <div class="mateu-panel mateu-panel-muted">
      <h2>Traditional stack</h2>
      <ul>
        <li>Backend model</li>
        <li>API layer</li>
        <li>Frontend views</li>
        <li>State management</li>
        <li>Validation in two places</li>
        <li>Repeated wiring between layers</li>
      </ul>
    </div>
    <div class="mateu-panel mateu-panel-strong">
      <h2>Mateu</h2>
      <ul>
        <li>Java model</li>
        <li>Declarative annotations</li>
        <li>Generated forms and CRUD</li>
        <li>Validation from the backend model</li>
        <li>One source of truth</li>
        <li>Less code to build and maintain</li>
      </ul>
    </div>
  </div>
</div>

---

<div class="mateu-container mateu-section">
  <div class="mateu-cta">
    <h2>Try Mateu with a real example</h2>
    <p>
      Start with the quickstart, then walk through the admin panel example and see how a complete business UI can come from a single Java model.
    </p>
    <div class="mateu-actions mateu-actions-center">
      <a href="/java-user-manual/getting-started/quickstart" class="mateu-btn mateu-btn-primary">Open quickstart</a>
      <a href="/java-user-manual/use-cases/admin-panel" class="mateu-btn mateu-btn-secondary">See admin panel</a>
    </div>
  </div>
</div>
