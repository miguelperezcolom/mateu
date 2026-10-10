package io.mateu.ijp.newfile

import com.fasterxml.jackson.databind.JsonNode

/**
 * A small draft-07 subset validator for the generated Mateu specs schema — enough for the shapes it
 * uses ($ref, oneOf/anyOf/allOf, type, const, enum, required, properties, items). STRICT on purpose:
 * the schema is open (no `additionalProperties: false`), so a typo'd key would otherwise pass; here an
 * object key that no applicable branch declares is an error.
 */
class MiniSchemaValidator(private val root: JsonNode) {

    fun validate(node: JsonNode): List<String> = errors(node, root, "$", strict = true)

    private fun resolve(schema: JsonNode): JsonNode {
        var s = schema
        while (s.has("\$ref")) {
            val ref = s["\$ref"].asText()
            require(ref.startsWith("#/")) { "external \$ref not supported: $ref" }
            s = ref.removePrefix("#/").split('/').fold(root) { acc, seg -> acc.path(seg) }
            check(!s.isMissingNode) { "dangling \$ref $ref" }
        }
        return s
    }

    private fun errors(node: JsonNode, schemaIn: JsonNode, path: String, strict: Boolean): List<String> {
        val schema = resolve(schemaIn)
        val errs = ArrayList<String>()

        schema["oneOf"]?.let { alts ->
            val results = alts.map { errors(node, it, path, strict) }
            val matches = results.count { it.isEmpty() }
            if (matches != 1) {
                errs += "$path: matches $matches of ${alts.size()} oneOf branches" + hint(node, alts, results)
            }
        }
        schema["anyOf"]?.let { alts ->
            val results = alts.map { errors(node, it, path, strict) }
            if (results.none { it.isEmpty() }) errs += "$path: matches no anyOf branch" + hint(node, alts, results)
        }
        schema["allOf"]?.let { parts ->
            parts.forEach { errs += errors(node, it, path, strict = false) }
            if (strict && node.isObject) {
                val known = parts.flatMap { declaredKeys(node, it, path) }.toSet()
                node.fieldNames().forEach { if (it !in known) errs += "$path: unknown key '$it'" }
            }
        }

        schema["type"]?.let { t ->
            val types = if (t.isArray) t.map { it.asText() } else listOf(t.asText())
            if (types.none { typeMatches(node, it) }) errs += "$path: expected ${types.joinToString("|")}, got ${node.nodeType}"
        }
        schema["const"]?.let { if (it != node) errs += "$path: expected const $it, got $node" }
        schema["enum"]?.let { e -> if (e.none { it == node }) errs += "$path: $node not in enum $e" }

        if (node.isObject) {
            schema["required"]?.forEach { if (!node.has(it.asText())) errs += "$path: missing required '${it.asText()}'" }
            val props = schema["properties"]
            if (props != null) {
                node.fields().forEach { (k, v) ->
                    val p = props[k]
                    if (p != null) {
                        errs += errors(v, p, "$path.$k", strict = true)
                    } else if (strict && schema["allOf"] == null) {
                        errs += "$path: unknown key '$k'"
                    }
                }
            }
        }
        if (node.isArray) {
            schema["items"]?.let { items -> node.forEachIndexed { i, v -> errs += errors(v, items, "$path[$i]", strict = true) } }
        }
        return errs
    }

    /** Keys a schema part declares for [node]: its properties, or those of the oneOf branch that fits. */
    private fun declaredKeys(node: JsonNode, schemaIn: JsonNode, path: String): Set<String> {
        val schema = resolve(schemaIn)
        val keys = HashSet<String>()
        schema["properties"]?.fieldNames()?.forEach { keys += it }
        schema["oneOf"]?.firstOrNull { errors(node, it, path, strict = false).isEmpty() }?.let { keys += declaredKeys(node, it, path) }
        schema["allOf"]?.forEach { keys += declaredKeys(node, it, path) }
        return keys
    }

    private fun typeMatches(node: JsonNode, type: String) = when (type) {
        "object" -> node.isObject
        "array" -> node.isArray
        "string" -> node.isTextual
        "boolean" -> node.isBoolean
        "integer" -> node.isIntegralNumber
        "number" -> node.isNumber
        "null" -> node.isNull
        else -> true
    }

    /** For a failed oneOf over components, show the errors of the branch whose `type` const matches. */
    private fun hint(node: JsonNode, alts: JsonNode, results: List<List<String>>): String {
        val t = node.path("type").asText(null) ?: return ""
        alts.forEachIndexed { i, alt ->
            if (resolve(alt).path("properties").path("type").path("const").asText() == t) {
                return " — as $t: " + results[i].take(5).joinToString("; ")
            }
        }
        return ""
    }
}
