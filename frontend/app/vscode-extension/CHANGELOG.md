# Changelog

All notable changes to the Mateu Visual Editor extension.

## Unreleased

- **Routes File** is now created EMPTY (`routes: []`, no sample routes pointing at files that do not
  exist), registered in the chosen `type: UI` mount's `routes:` list, with an optional `basePath`.
- **Mateu: Add Route…** (Explorer/editor context menu on a routes file + command palette): append one
  entry — layout (a discovered page or app shell), route, view model, parent — with a minimal text
  edit, and optionally make it the mount's `home:` page.
- New page → optionally adds its route to an existing routes file; new UI mount → optional home route.

## 0.1.0

- **Mateu: New File…** (Explorer folder context menu + command palette): create a UI mount, routes
  file, app shell, REST source catalogue or a page from 18 page templates with a chosen page width —
  the same catalogue and skeletons as the IntelliJ plugin's New › Mateu.
- Marketplace-ready packaging: icon, bundled LICENSE, `.vscodeignore`, repository/homepage/bugs
  metadata; `npm run package` (`vsce package`) runs non-interactively from a clean checkout.
- Activates only in workspaces that contain Mateu pages (`specs/ui/**/*.yaml|yml`) or when the
  Mateu visual editor is opened — no longer on every YAML file.
- Contributes the Mateu `specs/ui` authoring schema (`yamlValidation`, bundled at packaging time
  from `backend/shared/uidl/specs-schema.json`), so the Red Hat YAML extension offers completion and
  validation for `specs/ui/**` files.

## 0.0.1

- Custom editor `mateu.visualEditor` for `specs/ui/*.yaml` (palette + WYSIWYG canvas + properties),
  sharing the web bundle with the IntelliJ host; loopback backend proxy; "Create field/action in
  ViewModel" quick fixes.
