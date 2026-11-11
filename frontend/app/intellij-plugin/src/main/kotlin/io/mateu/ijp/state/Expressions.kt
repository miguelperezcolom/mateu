package io.mateu.ijp.state

/**
 * Tiny expression evaluator for rule filters, validation conditions and `${...}` label
 * interpolation — the same pragmatic subset the React Native renderer's engine covers: literals,
 * identifier paths (`state.total`, `state['a b']`), optional chaining (`?.`, `?.[]`), unary
 * `!`/`-`, arithmetic, comparisons (JavaScript's: two strings compare as text, otherwise as
 * numbers), loose `==`/`!=` and strict `===`/`!==`, `&&`/`||`/`??`, the ternary and regex literals
 * with `.test(…)` (the server's @Pattern condition), and — what a REST source url uses —
 * `String(x)`/`Number(x)`/`encodeURIComponent(x)`, `Math.round/floor/ceil/abs/min/max` and the
 * pure string/number/list methods of [METHODS] (the server's ProxyExpression set). Unknown syntax
 * throws — callers decide the fallback. The web, Redwood, React Native and this evaluator are held
 * to one corpus: conformance/client/expressions.json (ExpressionsConformanceTest); url templates to
 * conformance/client/source-templates.json (SourceTemplatesConformanceTest).
 */
object Expressions {

    fun evaluate(expr: String, ctx: Map<String, Any?>): Any? = Parser(tokenize(expr), ctx).parse()

    /** `i18n.orders.title` — the translation scope the server resolves (TranslationRegistry). */
    private val I18N_KEY = Regex("^i18n\\.([A-Za-z0-9_][A-Za-z0-9_.\\-]*)$")
    private val EXPRESSION = Regex("\\$\\{([^}]+)}")
    private val ESCAPE_OR_EXPRESSION = Regex("(\\\\\\\\|\\\\\\$\\{)|\\$\\{([^}]+)}")

    /**
     * A request BODY template: when the request declares JSON (a `Content-Type` naming json), every
     * text VALUE is JSON-escaped where it lands — the template itself never is. `{"name":"${state.name}"}`
     * broke on any value with a quote, a backslash or a newline (the endpoint answered 400). Numbers
     * and booleans are left alone. libs/mateu jsonTemplate.ts, RN core/jsonTemplate.ts.
     */
    fun interpolateBody(template: String?, headers: Map<String, String>, ctx: Map<String, Any?>): String =
        interpolate(template, ctx, json = declaresJson(headers))

    /** Whether a request declares a JSON body, which is when its values need escaping. */
    fun declaresJson(headers: Map<String, String>): Boolean =
        headers.any { (name, value) -> name.equals("content-type", ignoreCase = true) && value.lowercase().contains("json") }

    /** Escapes a value for the inside of a JSON string, without adding the surrounding quotes. */
    fun jsonEscape(value: String): String = buildString {
        for (ch in value) {
            when (ch) {
                '"' -> append("\\\"")
                '\\' -> append("\\\\")
                '\n' -> append("\\n")
                '\r' -> append("\\r")
                '\t' -> append("\\t")
                '\b' -> append("\\b")
                '\u000C' -> append("\\f")
                else -> if (ch < ' ') append("\\u%04x".format(ch.code)) else append(ch)
            }
        }
    }

    /** Replaces every `${expr}` with its evaluated value ('' on failure/null). */
    fun interpolate(template: String?, ctx: Map<String, Any?>): String = interpolate(template, ctx, json = false)

    private fun interpolate(template: String?, ctx: Map<String, Any?>, json: Boolean): String {
        if (template == null || !template.contains("\${")) return template ?: ""
        // A shown text honours the literal escapes the server writes around data
        // (`Templates.literal`): `\${` is a literal `${`, `\\` a backslash — the web's parseTemplate.
        // A body template (json) keeps its backslashes: they are JSON's own escapes there.
        return (if (json) EXPRESSION else ESCAPE_OR_EXPRESSION).replace(template) { m ->
            if (!json && m.groupValues[1].isNotEmpty()) {
                return@replace if (m.groupValues[1] == "\\\\") "\\" else "\${"
            }
            val expr = m.groupValues[if (json) 1 else 2]
            // `${i18n.key}` is resolved by the SERVER for the caller's language; one that reaches the
            // plugin unresolved (no catalogue on the server for it) shows as its key, never as blank.
            val i18n = I18N_KEY.matchEntire(expr.trim())
            if (i18n != null && ctx["i18n"] == null) return@replace i18n.groupValues[1]
            try {
                when (val v = evaluate(expr.trim(), ctx)) {
                    null -> ""
                    is Double -> if (v % 1.0 == 0.0 && !v.isInfinite()) v.toLong().toString() else v.toString()
                    is String -> if (json) jsonEscape(v) else v
                    is com.fasterxml.jackson.databind.JsonNode ->
                        if (json && v.isTextual) jsonEscape(v.asText()) else v.toString()
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
                // a list is `a,b`, as JavaScript's String() prints it (and every other leg sends it)
                jsText(evaluate(expr.trim(), ctx))
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

    private data class Token(val type: Char, val value: String, val flags: String = "") // n=num s=str i=id o=op r=regex

    /** Properties an expression may never read (the same set the web and RN evaluators refuse). */
    private val BLOCKED_PROPERTIES = setOf(
        "constructor", "__proto__", "prototype", "__defineGetter__", "__defineSetter__",
        "__lookupGetter__", "__lookupSetter__",
    )

    /** A `/` starts a regex literal where a VALUE is expected; after a value it is a division. */
    private fun regexAllowed(prev: Token?): Boolean =
        prev == null || (prev.type == 'o' && prev.value != ")" && prev.value != "]")

    /** A JavaScript regex as a Kotlin one (the server's @Pattern regexp is Java syntax anyway). */
    private fun regexOf(body: String, flags: String): Regex {
        val options = buildSet {
            if ('i' in flags) add(RegexOption.IGNORE_CASE)
            if ('m' in flags) add(RegexOption.MULTILINE)
            if ('s' in flags) add(RegexOption.DOT_MATCHES_ALL)
        }
        return Regex(body, options)
    }

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
                    // an exponent (`1e3`, `2.5E-2`)
                    if (j < src.length && (src[j] == 'e' || src[j] == 'E')) {
                        var k = j + 1
                        if (k < src.length && (src[k] == '+' || src[k] == '-')) k++
                        if (k < src.length && src[k].isDigit()) {
                            while (k < src.length && src[k].isDigit()) k++
                            j = k
                        }
                    }
                    tokens.add(Token('n', src.substring(i, j)))
                    i = j
                }
                ch == '\'' || ch == '"' || ch == '`' -> {
                    var j = i + 1
                    val out = StringBuilder()
                    while (j < src.length && src[j] != ch) {
                        if (src[j] == '\\' && j + 1 < src.length) { out.append(src[j + 1]); j += 2 } else { out.append(src[j]); j++ }
                    }
                    if (j >= src.length) throw IllegalArgumentException("unterminated string")
                    tokens.add(Token('s', out.toString()))
                    i = j + 1
                }
                ch == '/' && regexAllowed(tokens.lastOrNull()) -> {
                    var j = i + 1
                    var inClass = false
                    while (j < src.length && (inClass || src[j] != '/')) {
                        when (src[j]) {
                            '\\' -> j++
                            '[' -> inClass = true
                            ']' -> inClass = false
                        }
                        j++
                    }
                    if (j >= src.length) throw IllegalArgumentException("unterminated regex")
                    var k = j + 1
                    while (k < src.length && src[k] in 'a'..'z') k++
                    tokens.add(Token('r', src.substring(i + 1, j), src.substring(j + 1, k)))
                    i = k
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
                        // `?.` is optional chaining unless a digit follows (`a?.5:1` is a ternary)
                        two == "?." && !(i + 2 < src.length && src[i + 2].isDigit()) -> { tokens.add(Token('o', two)); i += 2 }
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

        /** `(a, b, …)` after a callee: the arguments, evaluated. */
        private fun arguments(): List<Any?> {
            eat("(")
            val args = ArrayList<Any?>()
            if (isOp(")")) { eat(")"); return args }
            while (true) {
                args.add(ternary())
                if (isOp(",")) { eat(","); continue }
                eat(")")
                return args
            }
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
                val eq = if (op.length == 3) strictEquals(left, right) else looseEquals(left, right)
                left = if (op.startsWith("=")) eq else !eq
            }
            return left
        }

        private fun comparison(): Any? {
            var left = additive()
            while (isOp(">") || isOp("<") || isOp(">=") || isOp("<=")) {
                val op = eat().value
                val right = additive()
                left = if (left is String && right is String) {
                    // two strings compare as text (ISO dates sort right), as in JavaScript
                    val c = left.compareTo(right)
                    when (op) { ">" -> c > 0; "<" -> c < 0; ">=" -> c >= 0; else -> c <= 0 }
                } else {
                    val l = num(left); val r = num(right)
                    when (op) { ">" -> l > r; "<" -> l < r; ">=" -> l >= r; else -> l <= r }
                }
            }
            return left
        }

        private fun additive(): Any? {
            var left = multiplicative()
            while (isOp("+") || isOp("-")) {
                val op = eat().value
                val right = multiplicative()
                left = if (op == "+" && (left is String || right is String)) "${display(left)}${display(right)}"
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
            // once a `?.` met null, the rest of the chain is parsed but not evaluated
            var short = false
            while (true) {
                val optional = isOp("?.")
                if (optional) {
                    eat("?.")
                    if (value == null) short = true
                }
                when {
                    isOp(".") || (optional && peek()?.type == 'i') -> {
                        if (!optional) eat(".")
                        val prop = eat()
                        require(prop.type == 'i') { "expected a property name" }
                        if (isOp("(")) {
                            // the calls an expression may make: a regex's `test` (the @Pattern
                            // condition), Math's pure functions and the pure string/number/list
                            // methods of METHODS — the set the server's proxied leg evaluates
                            // (ProxyExpression), held to conformance/client/source-templates.json
                            val args = arguments()
                            if (short) continue
                            val target = value
                            value = when {
                                target is Regex && prop.value == "test" -> target.containsMatchIn(display(args.firstOrNull()))
                                target === MATH -> math(prop.value, args)
                                prop.value in METHODS -> callMethod(target, prop.value, args)
                                else -> throw IllegalArgumentException("'${prop.value}' is not callable in expressions")
                            }
                        } else {
                            value = if (short) null else member(value, prop.value)
                        }
                    }
                    isOp("[") -> {
                        eat("["); val key = ternary(); eat("]")
                        value = if (short) null else member(value, display(key)) // rows[1]: the literal is 1.0, the index "1"
                    }
                    optional -> throw IllegalArgumentException("unexpected ?.")
                    else -> return if (short) null else value
                }
            }
        }

        private fun primary(): Any? {
            val t = peek() ?: throw IllegalArgumentException("unexpected end")
            return when {
                t.type == 'n' -> { eat(); t.value.toDouble() }
                t.type == 's' -> { eat(); t.value }
                t.type == 'r' -> { eat(); regexOf(t.value, t.flags) }
                t.type == 'i' -> {
                    eat()
                    when {
                        t.value == "true" -> true
                        t.value == "false" -> false
                        t.value == "null" || t.value == "undefined" -> null
                        t.value in FUNCTIONS && isOp("(") && !ctx.containsKey(t.value) -> {
                            val arg = arguments().firstOrNull()
                            when (t.value) {
                                "String" -> jsText(arg)
                                "Number" -> num(arg)
                                else -> urlEncode(jsText(arg))
                            }
                        }
                        t.value == "Math" && !ctx.containsKey("Math") -> MATH
                        else -> normalize(ctx[t.value])
                    }
                }
                t.value == "(" -> { eat("("); val v = ternary(); eat(")"); v }
                else -> throw IllegalArgumentException("unexpected token '${t.value}'")
            }
        }

        private fun member(target: Any?, prop: String): Any? {
            require(prop !in BLOCKED_PROPERTIES) { "Access to '$prop' is not allowed in expressions" }
            return memberOf(target, prop)
        }

        private fun memberOf(target: Any?, prop: String): Any? = normalize(when (target) {
            null -> null
            is Map<*, *> -> target[prop]
            is List<*> -> if (prop == "length") target.size.toDouble() else prop.toIntOrNull()?.let { target.getOrNull(it) }
            is com.fasterxml.jackson.databind.JsonNode -> {
                // An array is indexed by position (`state.rows[0]`): path(String) on an ArrayNode is
                // always missing, so a numeric key has to go through path(Int).
                val n = when {
                    prop == "length" && target.isArray -> return target.size().toDouble()
                    target.isArray -> prop.toIntOrNull()?.let { target.path(it) } ?: target.path(prop)
                    else -> target.path(prop)
                }
                when {
                    n.isMissingNode || n.isNull -> null
                    n.isNumber -> n.asDouble()
                    n.isBoolean -> n.asBoolean()
                    n.isTextual -> n.asText()
                    else -> n
                }
            }
            is String -> if (prop == "length") target.length.toDouble() else prop.toIntOrNull()?.let { i -> target.getOrNull(i)?.toString() }
            else -> null
        })
    }

    /** `Math`: only its pure rounding / min / max functions are reachable. */
    private val MATH = Any()

    /** The global functions an expression may call (one argument each). */
    private val FUNCTIONS = setOf("String", "Number", "encodeURIComponent")

    /** The methods of a string, number or list an expression may call — pure ones only (the
     *  server's ProxyExpression.METHODS). */
    val METHODS = setOf(
        "toLowerCase", "toUpperCase", "trim", "includes", "startsWith", "endsWith", "slice",
        "substring", "indexOf", "padStart", "padEnd", "toString", "toFixed", "join",
    )

    /** A list as plain values: a wire-backed array (JsonNode) unwrapped item by item. */
    private fun plainList(v: Any?): List<Any?>? = when {
        v is List<*> -> v.map { normalize(it) }
        v is com.fasterxml.jackson.databind.JsonNode && v.isArray -> v.map { normalize(it) }
        else -> null
    }

    /** A value as JavaScript's String() prints it: a list is its items joined by commas. */
    private fun jsText(v: Any?): String {
        val list = plainList(v)
        return if (list != null) list.joinToString(",") { jsText(it) } else display(v)
    }

    private fun math(name: String, args: List<Any?>): Double = when (name) {
        "round" -> num(args.firstOrNull()).let { if (it.isNaN() || it.isInfinite()) it else Math.floor(it + 0.5) }
        "floor" -> Math.floor(num(args.firstOrNull()))
        "ceil" -> Math.ceil(num(args.firstOrNull()))
        "abs" -> Math.abs(num(args.firstOrNull()))
        "min", "max" -> {
            var acc = if (name == "min") Double.POSITIVE_INFINITY else Double.NEGATIVE_INFINITY
            var nan = false
            for (a in args) {
                val d = num(a)
                if (d.isNaN()) nan = true
                acc = if (name == "min") minOf(acc, d) else maxOf(acc, d)
            }
            if (nan) Double.NaN else acc
        }
        else -> throw IllegalArgumentException("Math.$name is not supported in expressions")
    }

    /** JavaScript's ToIntegerOrInfinity, clamped to the int range (NaN → 0). */
    private fun toInteger(v: Any?): Long {
        val d = num(v)
        if (d.isNaN()) return 0
        return maxOf(Int.MIN_VALUE.toDouble(), minOf(Int.MAX_VALUE.toDouble(), d)).toLong()
    }

    /** `slice(start, end)`'s range: a negative index counts from the end, then clamped. */
    private fun sliceRange(length: Int, args: List<Any?>): IntRange {
        val s = if (args.isEmpty()) 0L else toInteger(args[0])
        val e = if (args.size < 2) length.toLong() else toInteger(args[1])
        val from = (if (s < 0) maxOf(length + s, 0L) else minOf(s, length.toLong())).toInt()
        val to = (if (e < 0) maxOf(length + e, 0L) else minOf(e, length.toLong())).toInt()
        return from until to
    }

    private fun pad(s: String, args: List<Any?>, start: Boolean): String {
        val target = toInteger(args.getOrNull(0))
        val fill = if (args.size < 2) " " else jsText(args[1])
        if (target <= s.length || fill.isEmpty()) return s
        require(target <= 10_000) { "pad length" }
        val padding = StringBuilder()
        while (padding.length < target - s.length) padding.append(fill)
        padding.setLength((target - s.length).toInt())
        return if (start) "$padding$s" else "$s$padding"
    }

    /** `value.name(args)`, with JavaScript's meaning, for the METHODS only. */
    private fun callMethod(value: Any?, name: String, args: List<Any?>): Any? {
        requireNotNull(value) { "cannot call '$name' of null" }
        val a0 = args.getOrNull(0)
        val list = plainList(value)
        return when {
            value is String -> when (name) {
                "toLowerCase" -> value.lowercase(java.util.Locale.ROOT)
                "toUpperCase" -> value.uppercase(java.util.Locale.ROOT)
                "trim" -> value.trim()
                "includes" -> value.contains(jsText(a0))
                "startsWith" -> value.startsWith(jsText(a0))
                "endsWith" -> value.endsWith(jsText(a0))
                "indexOf" -> value.indexOf(jsText(a0)).toDouble()
                "slice" -> sliceRange(value.length, args).let { if (it.isEmpty()) "" else value.substring(it.first, it.last + 1) }
                "substring" -> {
                    val from = toInteger(a0).coerceIn(0, value.length.toLong()).toInt()
                    val to = if (args.size < 2) value.length else toInteger(args[1]).coerceIn(0, value.length.toLong()).toInt()
                    value.substring(minOf(from, to), maxOf(from, to))
                }
                "padStart" -> pad(value, args, true)
                "padEnd" -> pad(value, args, false)
                "toString" -> value
                else -> throw IllegalArgumentException("'$name' is not a string method")
            }
            value is Number -> when (name) {
                "toString" -> display(value.toDouble())
                "toFixed" -> {
                    val digits = if (args.isEmpty()) 0L else toInteger(a0)
                    require(digits in 0..100) { "toFixed digits" }
                    java.math.BigDecimal(value.toDouble()).setScale(digits.toInt(), java.math.RoundingMode.HALF_UP).toPlainString()
                }
                else -> throw IllegalArgumentException("'$name' is not a number method")
            }
            list != null -> when (name) {
                "join" -> list.joinToString(if (args.isEmpty()) "," else jsText(a0)) { jsText(it) }
                "includes" -> list.any { strictEquals(it, a0) }
                "indexOf" -> list.indexOfFirst { strictEquals(it, a0) }.toDouble()
                "slice" -> sliceRange(list.size, args).let { r -> if (r.isEmpty()) emptyList() else list.subList(r.first, r.last + 1).toList() }
                "toString" -> jsText(list)
                else -> throw IllegalArgumentException("'$name' is not a list method")
            }
            value is Boolean && name == "toString" -> value.toString()
            else -> throw IllegalArgumentException("'$name' is not callable on $value")
        }
    }

    /** A value as JS would print it inside a string: whole doubles without ".0", null as "". */
    private fun display(v: Any?): String = when (v) {
        null -> ""
        is Double -> if (v % 1.0 == 0.0 && !v.isInfinite()) v.toLong().toString() else v.toString()
        else -> v.toString()
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

    /** JavaScript's numeric literal grammar for a string (Kotlin's parser also takes "1d", "1f"). */
    private val JS_NUMBER = Regex("^[+-]?(\\d+\\.?\\d*|\\.\\d+)([eE][+-]?\\d+)?$")

    /** A value as JavaScript's Number(): blank strings are 0, a non-numeric string NaN. */
    private fun num(v: Any?): Double = when (v) {
        is Number -> v.toDouble()
        is String -> v.trim().let { t ->
            when {
                t.isEmpty() -> 0.0
                JS_NUMBER.matches(t) -> t.toDouble()
                t == "Infinity" || t == "+Infinity" -> Double.POSITIVE_INFINITY
                t == "-Infinity" -> Double.NEGATIVE_INFINITY
                else -> Double.NaN
            }
        }
        is Boolean -> if (v) 1.0 else 0.0
        else -> Double.NaN
    }

    /** JavaScript's `==` on primitives: null only equals null; a boolean compares as a number;
     *  a number and a string compare as numbers; two strings as text. */
    private fun looseEquals(a: Any?, b: Any?): Boolean {
        if (a == null || b == null) return a == null && b == null
        if (isPrimitive(a) && isPrimitive(b)) return if (a is String && b is String) a == b else num(a) == num(b)
        return a == b || a.toString() == b.toString()
    }

    /** JavaScript's `===`: same kind and same value (numbers compare numerically, whatever their
     *  boxed type). */
    private fun strictEquals(a: Any?, b: Any?): Boolean {
        if (a == null || b == null) return a == null && b == null
        if (a is Number && b is Number) return a.toDouble() == b.toDouble()
        if (isPrimitive(a) || isPrimitive(b)) return a::class == b::class && a == b
        return a == b
    }

    private fun isPrimitive(v: Any): Boolean = v is Number || v is Boolean || v is String
}
