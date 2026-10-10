package io.mateu.ijp.state

/**
 * Tiny expression evaluator for rule filters, validation conditions and `${...}` label
 * interpolation — the same pragmatic subset the React Native renderer's engine covers (the
 * two parsers are kept in sync): literals, identifier paths (`state.total`, `state['a b']`),
 * unary `!`/`-`, arithmetic, comparisons (`==`/`!=` are loose), `&&`/`||`/`??` and the ternary.
 * Unknown syntax throws — callers decide the fallback.
 */
object Expressions {

    fun evaluate(expr: String, ctx: Map<String, Any?>): Any? = Parser(tokenize(expr), ctx).parse()

    /** `i18n.orders.title` — the translation scope the server resolves (TranslationRegistry). */
    private val I18N_KEY = Regex("^i18n\\.([A-Za-z0-9_][A-Za-z0-9_.\\-]*)$")

    /** Replaces every `${expr}` with its evaluated value ('' on failure/null). */
    fun interpolate(template: String?, ctx: Map<String, Any?>): String {
        if (template == null || !template.contains("\${")) return template ?: ""
        return Regex("\\$\\{([^}]+)}").replace(template) { m ->
            // `${i18n.key}` is resolved by the SERVER for the caller's language; one that reaches the
            // plugin unresolved (no catalogue on the server for it) shows as its key, never as blank.
            val i18n = I18N_KEY.matchEntire(m.groupValues[1].trim())
            if (i18n != null && ctx["i18n"] == null) return@replace i18n.groupValues[1]
            try {
                when (val v = evaluate(m.groupValues[1].trim(), ctx)) {
                    null -> ""
                    is Double -> if (v % 1.0 == 0.0 && !v.isInfinite()) v.toLong().toString() else v.toString()
                    else -> v.toString()
                }
            } catch (e: Exception) {
                ""
            }
        }
    }

    /**
     * Interpolates a URL template with every value percent-encoded by where it lands — exactly like
     * the server's proxied leg (`TemplateInterpolator.interpolateUrl`) and the web/RN renderers:
     * raw in the origin (a `${state…}` there is refused: the client state must not choose the
     * host), a path segment in the path (`.`/`..` refused), a query component after `?`/`#`.
     * Without it a value like `1/../../admin?x=` steered the request. Throws when a value is refused.
     */
    fun interpolateUrl(template: String?, ctx: Map<String, Any?>): String {
        if (template == null || !template.contains("\${")) return template ?: ""
        val origin = originEnd(template)
        return Regex("\\$\\{([^}]+)}").replace(template) { m ->
            val expr = m.groupValues[1]
            val value = try {
                when (val v = evaluate(expr.trim(), ctx)) {
                    null -> ""
                    is Double -> if (v % 1.0 == 0.0 && !v.isInfinite()) v.toLong().toString() else v.toString()
                    else -> v.toString()
                }
            } catch (e: Exception) {
                ""
            }
            if (m.range.first < origin) {
                require(!Regex("^\\s*state\\b").containsMatchIn(expr)) {
                    "A client state value cannot choose the origin of a URL: $template"
                }
                value
            } else {
                val before = template.substring(0, m.range.first).replace(Regex("\\$\\{[^}]*}"), "")
                if (!before.contains('?') && !before.contains('#')) {
                    require(value != "." && value != "..") { "A dot segment is not a valid path value: $value" }
                }
                urlEncode(value)
            }
        }
    }

    /** All but the RFC 3986 unreserved characters percent-encoded (UTF-8, upper-case hex). */
    fun urlEncode(value: String): String {
        val sb = StringBuilder()
        for (b in value.toByteArray(Charsets.UTF_8)) {
            val c = b.toInt() and 0xff
            if (c in 'A'.code..'Z'.code || c in 'a'.code..'z'.code || c in '0'.code..'9'.code ||
                c == '-'.code || c == '.'.code || c == '_'.code || c == '~'.code
            ) {
                sb.append(c.toChar())
            } else {
                sb.append('%').append("%02X".format(c))
            }
        }
        return sb.toString()
    }

    private fun originEnd(t: String): Int {
        val scheme = t.indexOf("://")
        val firstPlaceholder = t.indexOf("\${")
        if (scheme >= 0 && (firstPlaceholder < 0 || scheme < firstPlaceholder)) {
            var i = scheme + 3
            while (i < t.length) {
                if (t.startsWith("\${", i)) {
                    val close = t.indexOf('}', i)
                    i = if (close < 0) t.length else close + 1
                    continue
                }
                if (t[i] == '/' || t[i] == '?' || t[i] == '#') return i
                i++
            }
            return t.length
        }
        if (t.startsWith("\${")) {
            val close = t.indexOf('}')
            return if (close < 0) t.length else close + 1
        }
        return 0
    }

    private data class Token(val type: Char, val value: String) // n=num s=str i=id o=op

    private fun tokenize(src: String): List<Token> {
        val tokens = ArrayList<Token>()
        var i = 0
        while (i < src.length) {
            val ch = src[i]
            when {
                ch.isWhitespace() -> i++
                ch.isDigit() || (ch == '.' && i + 1 < src.length && src[i + 1].isDigit()) -> {
                    var j = i
                    while (j < src.length && (src[j].isDigit() || src[j] == '.')) j++
                    tokens.add(Token('n', src.substring(i, j)))
                    i = j
                }
                ch == '\'' || ch == '"' || ch == '`' -> {
                    var j = i + 1
                    val out = StringBuilder()
                    while (j < src.length && src[j] != ch) {
                        if (src[j] == '\\' && j + 1 < src.length) { out.append(src[j + 1]); j += 2 } else { out.append(src[j]); j++ }
                    }
                    tokens.add(Token('s', out.toString()))
                    i = j + 1
                }
                ch.isLetter() || ch == '_' || ch == '$' -> {
                    var j = i
                    while (j < src.length && (src[j].isLetterOrDigit() || src[j] == '_' || src[j] == '$')) j++
                    tokens.add(Token('i', src.substring(i, j)))
                    i = j
                }
                else -> {
                    val three = src.substring(i, minOf(i + 3, src.length))
                    val two = src.substring(i, minOf(i + 2, src.length))
                    when {
                        three == "===" || three == "!==" -> { tokens.add(Token('o', three)); i += 3 }
                        two in setOf("==", "!=", ">=", "<=", "&&", "||", "??") -> { tokens.add(Token('o', two)); i += 2 }
                        ch in "+-*/%<>!?:().[]," -> { tokens.add(Token('o', ch.toString())); i++ }
                        else -> throw IllegalArgumentException("unexpected character '$ch'")
                    }
                }
            }
        }
        return tokens
    }

    private class Parser(private val tokens: List<Token>, private val ctx: Map<String, Any?>) {
        private var pos = 0

        fun parse(): Any? {
            val v = ternary()
            require(pos >= tokens.size) { "trailing tokens" }
            return v
        }

        private fun peek(): Token? = tokens.getOrNull(pos)
        private fun isOp(v: String) = peek()?.let { it.type == 'o' && it.value == v } == true
        private fun eat(v: String? = null): Token {
            val t = tokens.getOrNull(pos++) ?: throw IllegalArgumentException("unexpected end")
            if (v != null && t.value != v) throw IllegalArgumentException("expected '$v'")
            return t
        }

        private fun ternary(): Any? {
            val cond = or()
            if (isOp("?")) {
                eat("?"); val a = ternary(); eat(":"); val b = ternary()
                return if (truthy(cond)) a else b
            }
            return cond
        }

        private fun or(): Any? {
            var left = and()
            while (isOp("||") || isOp("??")) {
                val op = eat().value
                val right = and()
                left = if (op == "||") (if (truthy(left)) left else right) else (left ?: right)
            }
            return left
        }

        private fun and(): Any? {
            var left = equality()
            while (isOp("&&")) { eat("&&"); val right = equality(); left = if (truthy(left)) right else left }
            return left
        }

        private fun equality(): Any? {
            var left = comparison()
            while (isOp("==") || isOp("!=") || isOp("===") || isOp("!==")) {
                val op = eat().value
                val right = comparison()
                val eq = looseEquals(left, right)
                left = when (op) { "==", "===" -> eq; else -> !eq }
            }
            return left
        }

        private fun comparison(): Any? {
            var left = additive()
            while (isOp(">") || isOp("<") || isOp(">=") || isOp("<=")) {
                val op = eat().value
                val l = num(left); val r = num(additive())
                left = when (op) { ">" -> l > r; "<" -> l < r; ">=" -> l >= r; else -> l <= r }
            }
            return left
        }

        private fun additive(): Any? {
            var left = multiplicative()
            while (isOp("+") || isOp("-")) {
                val op = eat().value
                val right = multiplicative()
                left = if (op == "+" && (left is String || right is String)) "${left ?: ""}${right ?: ""}"
                else if (op == "+") num(left) + num(right) else num(left) - num(right)
            }
            return left
        }

        private fun multiplicative(): Any? {
            var left = unary()
            while (isOp("*") || isOp("/") || isOp("%")) {
                val op = eat().value
                val l = num(left); val r = num(unary())
                left = when (op) { "*" -> l * r; "/" -> l / r; else -> l % r }
            }
            return left
        }

        private fun unary(): Any? {
            if (isOp("!")) { eat("!"); return !truthy(unary()) }
            if (isOp("-")) { eat("-"); return -num(unary()) }
            return postfix()
        }

        private fun postfix(): Any? {
            var value = primary()
            while (true) {
                when {
                    isOp(".") -> { eat("."); value = member(value, eat().value) }
                    isOp("[") -> { eat("["); val key = ternary(); eat("]"); value = member(value, key?.toString() ?: "") }
                    else -> return value
                }
            }
        }

        private fun primary(): Any? {
            val t = peek() ?: throw IllegalArgumentException("unexpected end")
            return when {
                t.type == 'n' -> { eat(); t.value.toDouble() }
                t.type == 's' -> { eat(); t.value }
                t.type == 'i' -> {
                    eat()
                    when (t.value) {
                        "true" -> true; "false" -> false; "null", "undefined" -> null
                        else -> normalize(ctx[t.value])
                    }
                }
                t.value == "(" -> { eat("("); val v = ternary(); eat(")"); v }
                else -> throw IllegalArgumentException("unexpected token '${t.value}'")
            }
        }

        private fun member(target: Any?, prop: String): Any? = normalize(when (target) {
            null -> null
            is Map<*, *> -> target[prop]
            is List<*> -> if (prop == "length") target.size.toDouble() else prop.toIntOrNull()?.let { target.getOrNull(it) }
            is com.fasterxml.jackson.databind.JsonNode -> {
                val n = if (prop == "length" && target.isArray) return target.size().toDouble() else target.path(prop)
                when {
                    n.isMissingNode || n.isNull -> null
                    n.isNumber -> n.asDouble()
                    n.isBoolean -> n.asBoolean()
                    n.isTextual -> n.asText()
                    else -> n
                }
            }
            is String -> if (prop == "length") target.length.toDouble() else null
            else -> null
        })
    }

    /** JsonNode values coming from wire-backed state unwrap to their primitive equivalents. */
    private fun normalize(v: Any?): Any? = when (v) {
        is com.fasterxml.jackson.databind.JsonNode -> when {
            v.isMissingNode || v.isNull -> null
            v.isNumber -> v.asDouble()
            v.isBoolean -> v.asBoolean()
            v.isTextual -> v.asText()
            else -> v
        }
        else -> v
    }

    fun truthy(v: Any?): Boolean = when (v) {
        null -> false
        is Boolean -> v
        is Number -> v.toDouble() != 0.0 && !v.toDouble().isNaN()
        is String -> v.isNotEmpty()
        is List<*> -> true
        else -> true
    }

    private fun num(v: Any?): Double = when (v) {
        is Number -> v.toDouble()
        is String -> v.toDoubleOrNull() ?: Double.NaN
        is Boolean -> if (v) 1.0 else 0.0
        else -> Double.NaN
    }

    private fun looseEquals(a: Any?, b: Any?): Boolean {
        if (a == null && b == null) return true
        if (a == null || b == null) return false
        if (a is Number || b is Number) {
            val na = num(a); val nb = num(b)
            if (!na.isNaN() && !nb.isNaN()) return na == nb
        }
        return a.toString() == b.toString()
    }
}
