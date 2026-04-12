---
title: "Mateu"
description: "Crea paneles de administración y UIs de negocio en Java. Sin frontend."
---

<div class="mateu-hero">
  <div class="mateu-container">
    <div class="mateu-grid mateu-grid-hero">
      <div>
        <p class="mateu-eyebrow">Framework UI para Java</p>
        <h1>Crea backoffices en minutos.<br />Sin frontend.</h1>
        <p class="mateu-lead">
          Define tu UI en Java. Mateu genera formularios, CRUD, navegación, validación y la shell de la aplicación a partir de un único modelo.
        </p>
        <div class="mateu-actions">
          <a href="/java-user-manual/getting-started/quickstart" class="mateu-btn mateu-btn-primary">Empezar</a>
          <a href="/java-user-manual/use-cases/admin-panel" class="mateu-btn mateu-btn-secondary">Ver ejemplo</a>
        </div>
        <div class="mateu-checks">
          <span>✔ CRUD listo para usar</span>
          <span>✔ Validación desde el modelo</span>
          <span>✔ Sin lógica duplicada</span>
        </div>
      </div>
      <div>
        <img src="/images/docs/admin-panel/products-list.jpeg" alt="Listado de productos generado con Mateu" class="mateu-shot" />
      </div>
    </div>
  </div>
</div>

---

<div class="mateu-container">
  <div class="mateu-grid mateu-grid-4">
    <div class="mateu-card">
      <h3>Un modelo</h3>
      <p>Define tu UI una sola vez en Java.</p>
    </div>
    <div class="mateu-card">
      <h3>UI generada</h3>
      <p>Formularios, CRUD y navegación salen automáticamente.</p>
    </div>
    <div class="mateu-card">
      <h3>Menos código</h3>
      <p>Menos piezas móviles, menos duplicación, menos bugs.</p>
    </div>
    <div class="mateu-card">
      <h3>Ideal para backend teams</h3>
      <p>Encaja especialmente bien con Java y Spring Boot.</p>
    </div>
  </div>
</div>

---

<div class="mateu-container mateu-section">
  <div class="mateu-grid mateu-grid-2">
    <div>
      <p class="mateu-eyebrow">Ejemplo real</p>
      <h2>Un panel completo a partir de un modelo Java</h2>
      <p class="mateu-text">
        Este es el tipo de UI para el que Mateu brilla: backoffices, herramientas internas e interfaces de negocio basadas en CRUD.
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
        Añades un repositorio y una clase UI, y Mateu genera el resto.
      </p>
      <p>
        <a href="/java-user-manual/use-cases/admin-panel" class="mateu-link">
          Ver el ejemplo completo del admin panel →
        </a>
      </p>
    </div>
    <div>
      <img src="/images/docs/admin-panel/new-product-form-empty.png" alt="Formulario generado por Mateu" class="mateu-shot mateu-shot-stack" />
      <img src="/images/docs/admin-panel/add-second-product-back-to-list.png" alt="Listado tras guardar el producto" class="mateu-shot" />
    </div>
  </div>
</div>

---

<div class="mateu-container mateu-section">
  <p class="mateu-eyebrow">Cómo funciona</p>
  <h2>Tres pasos</h2>
  <div class="mateu-grid mateu-grid-3">
    <div class="mateu-card">
      <div class="mateu-step">01</div>
      <h3>Define el modelo</h3>
      <p>Usa clases Java, campos, métodos y anotaciones para describir estado y comportamiento.</p>
    </div>
    <div class="mateu-card">
      <div class="mateu-step">02</div>
      <h3>Conecta los datos</h3>
      <p>Añade un repositorio o adaptador. Mantén separadas persistencia y UI.</p>
    </div>
    <div class="mateu-card">
      <div class="mateu-step">03</div>
      <h3>Ejecuta</h3>
      <p>Mateu genera formularios, CRUD, validación, navegación y comportamiento de shell automáticamente.</p>
    </div>
  </div>
</div>

---

<div class="mateu-container mateu-section">
  <p class="mateu-eyebrow">Dónde encaja mejor</p>
  <h2>Casos en los que Mateu destaca</h2>
  <div class="mateu-grid mateu-grid-3">
    <div class="mateu-card">
      <h3>Admin panels</h3>
      <p>Construye backoffices, consolas de gestión y UIs de negocio basadas en CRUD con máxima velocidad.</p>
    </div>
    <div class="mateu-card">
      <h3>UIs distribuidas</h3>
      <p>Deja que cada microservicio defina su propia UI y compón todo en una shell común.</p>
    </div>
    <div class="mateu-card">
      <h3>UIs embebibles</h3>
      <p>Genera interfaces de negocio que puedas incrustar en apps hechas con React, Vue u otros frameworks.</p>
    </div>
  </div>
</div>

---

<div class="mateu-container mateu-section">
  <div class="mateu-grid mateu-grid-2">
    <div class="mateu-panel mateu-panel-muted">
      <h2>Stack tradicional</h2>
      <ul>
        <li>Modelo backend</li>
        <li>Capa API</li>
        <li>Vistas frontend</li>
        <li>Gestión de estado</li>
        <li>Validación en dos sitios</li>
        <li>Wiring repetido entre capas</li>
      </ul>
    </div>
    <div class="mateu-panel mateu-panel-strong">
      <h2>Mateu</h2>
      <ul>
        <li>Modelo Java</li>
        <li>Anotaciones declarativas</li>
        <li>Formularios y CRUD generados</li>
        <li>Validación desde el modelo backend</li>
        <li>Una única fuente de verdad</li>
        <li>Menos código que construir y mantener</li>
      </ul>
    </div>
  </div>
</div>

---

<div class="mateu-container mateu-section">
  <div class="mateu-cta">
    <h2>Prueba Mateu con un ejemplo real</h2>
    <p>
      Empieza por el quickstart y luego recorre el ejemplo del admin panel para ver cómo una UI de negocio completa puede salir de un único modelo Java.
    </p>
    <div class="mateu-actions mateu-actions-center">
      <a href="/java-user-manual/getting-started/quickstart" class="mateu-btn mateu-btn-primary">Abrir quickstart</a>
      <a href="/java-user-manual/use-cases/admin-panel" class="mateu-btn mateu-btn-secondary">Ver admin panel</a>
    </div>
  </div>
</div>
