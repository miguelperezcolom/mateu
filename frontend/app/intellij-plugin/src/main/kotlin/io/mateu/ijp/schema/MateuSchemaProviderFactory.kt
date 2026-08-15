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
 * by UidlSchemaGenerator) covers all four file kinds; its `type` discriminator selects the branch:
 * UI mount, Routes route file, AppShell app shell, or a page component. No `$schema` line is needed
 * in the file — this maps by path.
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
