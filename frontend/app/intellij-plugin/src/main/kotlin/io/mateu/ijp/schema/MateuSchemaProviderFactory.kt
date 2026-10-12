package io.mateu.ijp.schema

import com.intellij.openapi.project.Project
import com.intellij.openapi.vfs.VirtualFile
import com.jetbrains.jsonSchema.extension.JsonSchemaFileProvider
import com.jetbrains.jsonSchema.extension.JsonSchemaProviderFactory
import com.jetbrains.jsonSchema.extension.SchemaType

/**
 * Applies the Mateu authoring schema to every YAML under a `specs/ui` folder in the raw TEXT editor,
 * so a user gets validation and completion even without switching to the visual editor (which is
 * already schema-driven from its own bundled copy). One unified schema (specs-schema.json, generated
 * by UidlSchemaGenerator) covers every file kind — UI mount, routes, sources, actions, translations,
 * environment, field types, project descriptor, app shell and page — its `type` discriminator selecting
 * the branch. No `$schema` line is needed in the file — this maps by path.
 *
 * Registered on `JavaScript.JsonSchema.ProviderFactory` (plugin.xml); MateuSchemaProviderTest pins
 * that every kind resolves this schema and completes in a booted IDE.
 */
class MateuSchemaProviderFactory : JsonSchemaProviderFactory {
    override fun getProviders(project: Project): List<JsonSchemaFileProvider> =
        listOf(SpecsSchemaProvider())
}

private class SpecsSchemaProvider : JsonSchemaFileProvider {

    override fun isAvailable(file: VirtualFile): Boolean {
        val name = file.name
        if (!name.endsWith(".yaml") && !name.endsWith(".yml")) return false
        return file.path.replace('\\', '/').contains("/specs/ui/")
    }

    override fun getName(): String = "Mateu specs/ui"

    override fun getSchemaFile(): VirtualFile? =
        JsonSchemaProviderFactory.getResourceFile(javaClass, "/schema/specs-schema.json")

    override fun getSchemaType(): SchemaType = SchemaType.embeddedSchema
}
