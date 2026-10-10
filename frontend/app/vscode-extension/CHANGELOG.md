# Changelog

All notable changes to the Mateu Visual Editor extension.

## 0.1.0

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
