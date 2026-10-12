package io.mateu.ijp.schema

import com.intellij.testFramework.fixtures.BasePlatformTestCase
import com.jetbrains.jsonSchema.ide.JsonSchemaService

/**
 * The text-editor authoring support for specs/ui YAML: every file kind of specs-schema.json's `oneOf`
 * must resolve OUR schema (through the registered JsonSchemaProviderFactory, not a user mapping) and
 * offer the schema's real keys/values in completion. Boots the platform with the bundled YAML + JSON
 * plugins, so a provider registered under a wrong extension point, a resource missing from the jar or
 * a schema the IntelliJ engine cannot read all fail here.
 */
class MateuSchemaProviderTest : BasePlatformTestCase() {

  private val caret = "<caret>"

  /** Creates [path] (relative to the project source root) with [text] and opens it in the editor. */
  private fun open(path: String, text: String) {
    val file = myFixture.addFileToProject(path, text)
    myFixture.configureFromExistingVirtualFile(file.virtualFile)
  }

  private fun assertMateuSchema() {
    val service = JsonSchemaService.Impl.get(project)
    val file = myFixture.file.virtualFile
    val schemas = service.getSchemaFilesForFile(file)
    assertTrue(
      "no Mateu schema for ${file.path}: ${schemas.map { it.path }}",
      schemas.any { it.name == "specs-schema.json" },
    )
    assertNotNull("schema object not built for ${file.path}", service.getSchemaObject(myFixture.file))
  }

  private fun completions(): List<String> {
    myFixture.completeBasic()
    return myFixture.lookupElementStrings ?: emptyList()
  }

  private fun assertOffers(path: String, text: String, vararg expected: String) {
    open(path, text)
    assertMateuSchema()
    val offered = completions()
    for (e in expected) assertTrue("'$e' not offered in $path; got $offered", e in offered)
  }

  fun testTypeValuesAreOfferedForEveryFileKind() = assertOffers(
    "specs/ui/new.yaml",
    "type: $caret\n",
    "UI", "Routes", "Sources", "Actions", "Translations", "Environment", "Types", "Project", "AppShell",
    "VerticalLayout",
  )

  fun testUiMount() = assertOffers("specs/ui/shop.yaml", "type: UI\n$caret\n", "basePath", "home", "routes")

  fun testRoutesFileEntry() = assertOffers(
    "specs/ui/routes.yaml",
    "type: Routes\nroutes:\n  - route: orders\n    $caret\n",
    "layout", "viewModel", "fixedParams",
  )

  fun testBareRouteList() = assertOffers(
    "specs/ui/shop/routes.yaml",
    "- route: orders\n  $caret\n",
    "layout", "viewModel",
  )

  fun testSourcesCatalogueEntry() = assertOffers(
    "specs/ui/sources.yaml",
    "type: Sources\nsources:\n  - name: countries\n    $caret\n",
    "source", "provenance",
  )

  fun testActionsCatalogue() = assertOffers("specs/ui/actions.yaml", "type: Actions\n$caret\n", "actions")

  fun testTranslations() =
    assertOffers("specs/ui/translations/es.yaml", "type: Translations\n$caret\n", "locale", "messages")

  fun testEnvironment() =
    assertOffers("specs/ui/environments/pre.yaml", "type: Environment\n$caret\n", "name", "sources")

  fun testFieldTypesCatalogue() = assertOffers("specs/ui/types.yaml", "type: Types\n$caret\n", "types")

  fun testProjectDescriptor() = assertOffers("specs/ui/project.yaml", "type: Project\n$caret\n", "renderer")

  fun testPageDefinition() =
    assertOffers("specs/ui/orders.yaml", "type: VerticalLayout\n$caret\n", "content", "viewModel")

  fun testAppShell() = assertOffers("specs/ui/shell.yaml", "type: AppShell\n$caret\n", "homeRoute", "viewModel")

  fun testYmlExtensionAndNestedFolders() =
    assertOffers("module/src/main/resources/specs/ui/deep/routes.yml", "type: Routes\n$caret\n", "routes")

  fun testFilesOutsideSpecsUiAreLeftAlone() {
    open("config/application.yaml", "server:\n  port: 8080\n")
    val schemas = JsonSchemaService.Impl.get(project).getSchemaFilesForFile(myFixture.file.virtualFile)
    assertFalse(schemas.any { it.name == "specs-schema.json" })
  }
}
