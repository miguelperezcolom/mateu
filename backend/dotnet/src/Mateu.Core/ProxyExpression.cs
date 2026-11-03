using System.Collections;
using System.Globalization;
using System.Text;
using System.Text.Json;

namespace Mateu.Core;

/// <summary>
/// The expression subset a REST source template evaluates on the SERVER — the proxied leg — with the
/// meaning the browser's sandboxed evaluator (<c>libs/mateu infra/ui/expression.ts</c>) gives it, so
/// flipping a source to <c>proxy: true</c> does not turn a working <c>${(state.page ?? 0) * 20}</c>
/// into an empty value. The .NET twin of Java's <c>io.mateu.core.domain.ProxyExpression</c> and
/// Python's <c>mateu_ui.core.proxy_expression</c>; pinned by
/// <c>conformance/client/source-templates.json</c>.
/// <para>Supported: literals, the roots <c>state</c> and <c>secret</c> (any other bare name reads the
/// state), <c>a.b</c>, <c>a?.b</c>, <c>a[i]</c>, <c>a?.[i]</c>, unary <c>! - +</c>, <c>* / % + -</c>,
/// comparisons, <c>== !=</c> (loose) and <c>=== !==</c> (strict), <c>&amp;&amp; || ??</c>, <c>?:</c>,
/// parentheses, number literals with an exponent (<c>1e3</c>), a string's characters (<c>s[0]</c>),
/// the calls <c>encodeURIComponent</c>, <c>String</c>, <c>Number</c>, <c>JSON.stringify</c>,
/// <c>Math.round/floor/ceil/abs/min/max</c> and the pure methods in <see cref="Methods"/> of a string,
/// number or list (<c>state.code.toLowerCase()</c>). <c>data</c>,
/// <c>appState</c> and <c>appData</c> exist only in the browser. Anything else throws
/// <see cref="UnsupportedException"/>. Never evaluates code.</para>
/// </summary>
internal sealed class ProxyExpression
{
    /// <summary>An expression outside the supported subset.</summary>
    public sealed class UnsupportedException(string message) : Exception(message);

    /// <summary><c>undefined</c>: what an absent name or member evaluates to (distinct from null).</summary>
    public static readonly object Undefined = new UndefinedValue();

    private sealed class UndefinedValue
    {
        public override string ToString() => "undefined";
    }

    private sealed class SecretScope;

    /// <summary>The names that exist only in the browser's scope.</summary>
    public static readonly IReadOnlyList<string> ClientOnlyRoots = ["data", "appState", "appData"];

    private static readonly string[] Punctuators =
    [
        "===", "!==", "?.[", "?.", "??", "==", "!=", "<=", ">=", "&&", "||", "(", ")", "[", "]",
        ".", ",", "?", ":", "!", "+", "-", "*", "/", "%", "<", ">",
    ];

    private const char StringMark = '\u0000';

    private readonly string _src;
    private readonly List<string> _tokens;
    private int _pos;
    private readonly IReadOnlyDictionary<string, object?> _state;
    private readonly Func<string, string?>? _secrets;
    private bool _skip;

    private ProxyExpression(string src, IReadOnlyDictionary<string, object?> state, Func<string, string?>? secrets)
    {
        _src = src;
        _tokens = Tokenize(src);
        _state = state;
        _secrets = secrets;
    }

    /// <summary>The value <paramref name="expression"/> names against the state (and the server's
    /// secrets): a .NET value, null, or <see cref="Undefined"/>.</summary>
    /// <exception cref="UnsupportedException">syntax outside the subset</exception>
    public static object? Evaluate(string expression, IReadOnlyDictionary<string, object?>? state, Func<string, string?>? secrets)
    {
        var e = new ProxyExpression(expression, state ?? new Dictionary<string, object?>(), secrets);
        var value = e.Expression(0);
        if (e._pos < e._tokens.Count)
            throw new UnsupportedException("unexpected '" + e._tokens[e._pos] + "' in ${" + expression + "}");
        return value;
    }

    /// <summary>Whether <paramref name="expression"/> parses within the subset (evaluated against an
    /// empty state). The validator uses it to flag a proxied source's template.</summary>
    public static bool IsSupported(string expression)
    {
        try
        {
            Evaluate(expression, new Dictionary<string, object?>(), _ => null);
            return true;
        }
        catch (UnsupportedException)
        {
            return false;
        }
        catch (Exception)
        {
            return true; // a runtime problem with THIS empty state, not the syntax
        }
    }

    // ── tokens ───────────────────────────────────────────────────────────────────────────────

    private static List<string> Tokenize(string s)
    {
        var output = new List<string>();
        var i = 0;
        while (i < s.Length)
        {
            var c = s[i];
            if (char.IsWhiteSpace(c))
            {
                i++;
                continue;
            }
            if (c is '\'' or '"')
            {
                var sb = new StringBuilder().Append(StringMark);
                var j = i + 1;
                while (j < s.Length && s[j] != c)
                {
                    var ch = s[j];
                    if (ch == '\\' && j + 1 < s.Length)
                    {
                        var n = s[++j];
                        sb.Append(n switch { 'n' => '\n', 't' => '\t', 'r' => '\r', _ => n });
                    }
                    else sb.Append(ch);
                    j++;
                }
                if (j >= s.Length) throw new UnsupportedException("unterminated string in ${" + s + "}");
                output.Add(sb.ToString());
                i = j + 1;
                continue;
            }
            if (char.IsDigit(c) || (c == '.' && i + 1 < s.Length && char.IsDigit(s[i + 1])))
            {
                var j = i;
                while (j < s.Length && (char.IsDigit(s[j]) || s[j] == '.')) j++;
                // an exponent, as in JS: 1e3, 2.5E-2
                if (j < s.Length && s[j] is 'e' or 'E')
                {
                    var k = j + 1;
                    if (k < s.Length && s[k] is '+' or '-') k++;
                    if (k < s.Length && char.IsDigit(s[k]))
                    {
                        while (k < s.Length && char.IsDigit(s[k])) k++;
                        j = k;
                    }
                }
                output.Add(s[i..j]);
                i = j;
                continue;
            }
            if (char.IsLetter(c) || c is '_' or '$')
            {
                var j = i;
                while (j < s.Length && (char.IsLetterOrDigit(s[j]) || s[j] is '_' or '$')) j++;
                output.Add(s[i..j]);
                i = j;
                continue;
            }
            string? matched = null;
            foreach (var p in Punctuators)
            {
                if (string.CompareOrdinal(s, i, p, 0, p.Length) != 0) continue;
                // `a ?.5 : b` is a conditional, not optional chaining (JS's rule)
                if (p == "?." && i + 2 < s.Length && char.IsDigit(s[i + 2])) continue;
                matched = p;
                break;
            }
            if (matched is null) throw new UnsupportedException("'" + c + "' is not supported in ${" + s + "}");
            output.Add(matched);
            i += matched.Length;
        }
        return output;
    }

    private string? Peek() => _pos < _tokens.Count ? _tokens[_pos] : null;

    private string Next()
    {
        if (_pos >= _tokens.Count) throw new UnsupportedException("unexpected end of ${" + _src + "}");
        return _tokens[_pos++];
    }

    private void Expect(string token)
    {
        var t = Next();
        if (t != token) throw new UnsupportedException("expected '" + token + "' but found '" + t + "' in ${" + _src + "}");
    }

    // ── grammar (precedence climbing; short-circuit forms evaluate lazily) ──────────────────────

    private static int Precedence(string? op) => op switch
    {
        "??" => 1,
        "||" => 2,
        "&&" => 3,
        "==" or "!=" or "===" or "!==" => 4,
        "<" or "<=" or ">" or ">=" => 5,
        "+" or "-" => 6,
        "*" or "/" or "%" => 7,
        _ => -1,
    };

    private object? Skipping(bool skipThis, Func<object?> body)
    {
        var before = _skip;
        _skip = before || skipThis;
        try
        {
            return body();
        }
        finally
        {
            _skip = before;
        }
    }

    private object? Expression(int minPrec)
    {
        var left = Binary(minPrec);
        if (minPrec == 0 && Peek() == "?")
        {
            Next();
            // both branches are PARSED; the one not taken is skipped (never evaluated), as in JS
            var taken = Truthy(left);
            var whenTrue = Skipping(!taken, () => Expression(0));
            Expect(":");
            var whenFalse = Skipping(taken, () => Expression(0));
            return taken ? whenTrue : whenFalse;
        }
        return left;
    }

    private object? Binary(int minPrec)
    {
        var left = Unary();
        while (true)
        {
            var op = Peek();
            var prec = Precedence(op);
            if (prec < 0 || prec < minPrec) return left;
            Next();
            var l = left;
            var decided = op switch
            {
                "??" => !IsAbsent(l),
                "||" => Truthy(l),
                "&&" => !Truthy(l),
                _ => false,
            };
            var right = Skipping(decided, () => Binary(prec + 1));
            if (decided) continue; // the left side decides and stays
            left = _skip ? Undefined : Apply(op!, l, right);
        }
    }

    private object? Unary()
    {
        switch (Peek())
        {
            case "!":
                Next();
                return !Truthy(Unary());
            case "-":
                Next();
                return -ToNumber(Unary());
            case "+":
                Next();
                return ToNumber(Unary());
            default:
                return Postfix(Primary());
        }
    }

    private object? Primary()
    {
        var t = Next();
        if (t == "(")
        {
            var v = Expression(0);
            Expect(")");
            return v;
        }
        if (t[0] == StringMark) return t[1..];
        if (char.IsDigit(t[0]) || t[0] == '.')
        {
            if (double.TryParse(t, NumberStyles.Float, CultureInfo.InvariantCulture, out var d)) return d;
            throw new UnsupportedException("'" + t + "' is not a number in ${" + _src + "}");
        }
        switch (t)
        {
            case "true": return true;
            case "false": return false;
            case "null": return null;
            case "undefined": return Undefined;
            case "encodeURIComponent" or "String" or "Number": return Call(t);
            case "JSON":
                Expect(".");
                var member = Next();
                if (member != "stringify") throw new UnsupportedException("JSON." + member + " is not supported in ${" + _src + "}");
                return Call("JSON.stringify");
            case "Math": return MathScope;
            case "state": return _skip ? Undefined : _state;
            case "secret": return new SecretScope();
        }
        if (!char.IsLetter(t[0]) && t[0] != '_' && t[0] != '$')
            throw new UnsupportedException("unexpected '" + t + "' in ${" + _src + "}");
        if (ClientOnlyRoots.Contains(t)) return Undefined;
        // searchText, page, size… — top-level names the browser offers — live in the state here
        return _state.TryGetValue(t, out var value) ? Norm(value) : Undefined;
    }

    private object? Call(string fn)
    {
        Expect("(");
        var arg = Expression(0);
        Expect(")");
        if (_skip) return Undefined;
        return fn switch
        {
            "encodeURIComponent" => EncodeUriComponent(Text(arg)),
            "String" => Text(arg),
            "Number" => ToNumber(arg),
            _ => Stringify(arg),
        };
    }

    private object? Postfix(object? value)
    {
        while (true)
        {
            var t = Peek();
            if (t is "." or "?.")
            {
                Next();
                var name = Next();
                if (name[0] == StringMark || !(char.IsLetter(name[0]) || name[0] is '_' or '$'))
                    throw new UnsupportedException("a member name was expected in ${" + _src + "}");
                var calls = Peek() == "(";
                if (t == "?." && IsAbsent(value))
                {
                    if (calls)
                    {
                        var before = _skip;
                        _skip = true;
                        try { Arguments(); } finally { _skip = before; }
                    }
                    value = Undefined;
                    continue;
                }
                value = calls ? CallMethod(value, name, Arguments()) : Member(value, name);
            }
            else if (t is "[" or "?.[")
            {
                Next();
                var key = Expression(0);
                Expect("]");
                if (t == "?.[" && IsAbsent(value))
                {
                    value = Undefined;
                    continue;
                }
                value = Member(value, key);
            }
            else if (t == "(")
                throw new UnsupportedException("only encodeURIComponent, String, Number, JSON.stringify, Math functions and"
                    + " allow-listed string/number/list methods can be called");
            else return value;
        }
    }

    /// <summary><c>obj[key]</c>: an object entry, a list element, a string's length. Nothing else.</summary>
    private object? Member(object? obj, object? key)
    {
        if (_skip) return Undefined;
        // a.b on null throws in the browser; the placeholder renders empty either way
        if (IsAbsent(obj)) throw new InvalidOperationException("cannot read '" + Text(key) + "' of " + Text(obj));
        if (obj is SecretScope) return _secrets is not null ? _secrets(Text(key)) : Undefined;
        var name = key is double d && d == Math.Floor(d) ? ((long)d).ToString(CultureInfo.InvariantCulture) : Text(key);
        switch (obj)
        {
            case JsonElement { ValueKind: JsonValueKind.Object } el:
                return el.TryGetProperty(name, out var child) ? Norm(child) : Undefined;
            case JsonElement { ValueKind: JsonValueKind.Array } arr:
                if (name == "length") return (double)arr.GetArrayLength();
                return int.TryParse(name, NumberStyles.None, CultureInfo.InvariantCulture, out var ai) && ai < arr.GetArrayLength()
                    ? Norm(arr[ai]) : Undefined;
            case IReadOnlyDictionary<string, object?> ro:
                return ro.TryGetValue(name, out var rv) ? Norm(rv) : Undefined;
            case IDictionary<string, object?> map:
                return map.TryGetValue(name, out var mv) ? Norm(mv) : Undefined;
            case string s:
                if (name == "length") return (double)s.Length;
                return int.TryParse(name, NumberStyles.None, CultureInfo.InvariantCulture, out var si) && si < s.Length
                    ? s[si].ToString() : Undefined;
            case IList list:
                if (name == "length") return (double)list.Count;
                return int.TryParse(name, NumberStyles.None, CultureInfo.InvariantCulture, out var li) && li < list.Count
                    ? Norm(list[li]) : Undefined;
            default:
                return Undefined;
        }
    }

    /// <summary><c>(a, b, …)</c> after a callee: the arguments, evaluated (skipped in an untaken branch).</summary>
    private List<object?> Arguments()
    {
        Expect("(");
        var args = new List<object?>();
        if (Peek() == ")")
        {
            Next();
            return args;
        }
        while (true)
        {
            args.Add(Expression(0));
            var t = Next();
            if (t == ")") return args;
            if (t != ",") throw new UnsupportedException("expected ',' or ')' but found '" + t + "' in ${" + _src + "}");
        }
    }

    /// <summary><c>Math</c>: only its pure rounding / min / max functions are reachable.</summary>
    private static readonly object MathScope = new();

    private static readonly HashSet<string> MathFunctions = ["round", "floor", "ceil", "abs", "min", "max"];

    /// <summary>The methods of a string, number or list an expression may call — pure ones only (Java's
    /// <c>ProxyExpression.METHODS</c>).</summary>
    public static readonly IReadOnlySet<string> Methods = new HashSet<string>
    {
        "toLowerCase", "toUpperCase", "trim", "includes", "startsWith", "endsWith", "slice", "substring",
        "indexOf", "padStart", "padEnd", "toString", "toFixed", "join",
    };

    /// <summary><c>value.name(args)</c>, with JavaScript's meaning, for the allow-listed methods only.</summary>
    private object? CallMethod(object? value, string name, List<object?> args)
    {
        if (ReferenceEquals(value, MathScope))
        {
            if (!MathFunctions.Contains(name)) throw new UnsupportedException("Math." + name + " is not supported in ${" + _src + "}");
            return _skip ? Undefined : MathCall(name, args);
        }
        if (!Methods.Contains(name)) throw new UnsupportedException("'" + name + "' cannot be called in ${" + _src + "}");
        if (_skip) return Undefined;
        value = Norm(value);
        if (IsAbsent(value)) throw new InvalidOperationException("cannot call '" + name + "' of " + Text(value));
        var a0 = args.Count > 0 ? args[0] : Undefined;
        var a1 = args.Count > 1 ? args[1] : Undefined;
        switch (value)
        {
            case string s: return StringMethod(s, name, a0, a1);
            case double d: return NumberMethod(d, name, a0);
            case bool b when name == "toString": return b ? "true" : "false";
        }
        var list = AsList(value);
        if (list is not null) return ListMethod(list, name, a0, a1);
        throw new InvalidOperationException("'" + name + "' is not callable on " + Text(value));
    }

    private static List<object?>? AsList(object? v) => v switch
    {
        JsonElement { ValueKind: JsonValueKind.Array } el => el.EnumerateArray().Select(e => Norm(e)).ToList(),
        IList list => list.Cast<object?>().Select(Norm).ToList(),
        _ => null,
    };

    private static object StringMethod(string s, string name, object? a0, object? a1)
    {
        switch (name)
        {
            case "toLowerCase": return s.ToLowerInvariant();
            case "toUpperCase": return s.ToUpperInvariant();
            case "trim": return s.Trim();
            case "includes": return s.Contains(Text(a0), StringComparison.Ordinal);
            case "startsWith": return s.StartsWith(Text(a0), StringComparison.Ordinal);
            case "endsWith": return s.EndsWith(Text(a0), StringComparison.Ordinal);
            case "indexOf": return (double)s.IndexOf(Text(a0), StringComparison.Ordinal);
            case "slice":
            {
                var (from, to) = SliceRange(s.Length, a0, a1);
                return from < to ? s[from..to] : "";
            }
            case "substring":
            {
                var from = Clamp(ToInteger(a0), s.Length);
                var to = ReferenceEquals(a1, Undefined) ? s.Length : Clamp(ToInteger(a1), s.Length);
                return s[Math.Min(from, to)..Math.Max(from, to)];
            }
            case "padStart": return Pad(s, a0, a1, true);
            case "padEnd": return Pad(s, a0, a1, false);
            case "toString": return s;
            default: throw new InvalidOperationException("'" + name + "' is not a string method");
        }
    }

    private static object NumberMethod(double d, string name, object? a0)
    {
        switch (name)
        {
            case "toString": return NumberText(d);
            case "toFixed":
            {
                var digits = ReferenceEquals(a0, Undefined) ? 0 : ToInteger(a0);
                if (digits is < 0 or > 100) throw new InvalidOperationException("toFixed digits");
                return ToFixed(d, (int)digits);
            }
            default: throw new InvalidOperationException("'" + name + "' is not a number method");
        }
    }

    /// <summary>JavaScript's <c>toFixed</c>: the EXACT value the double holds, rounded half away from
    /// zero to <paramref name="digits"/> decimals (Java's <c>new BigDecimal(d).setScale(HALF_UP)</c>).</summary>
    private static string ToFixed(double d, int digits)
    {
        if (double.IsNaN(d)) return "NaN";
        if (double.IsInfinity(d)) return d > 0 ? "Infinity" : "-Infinity";
        var negative = d < 0;
        var bits = BitConverter.DoubleToInt64Bits(Math.Abs(d));
        var exponent = (int)((bits >> 52) & 0x7FF);
        var mantissa = bits & 0xFFFFFFFFFFFFFL;
        if (exponent == 0) exponent = 1; else mantissa |= 1L << 52;
        exponent -= 1075; // |d| = mantissa · 2^exponent
        var scaled = new System.Numerics.BigInteger(mantissa) * System.Numerics.BigInteger.Pow(10, digits);
        System.Numerics.BigInteger n;
        if (exponent >= 0) n = scaled << exponent;
        else
        {
            var divisor = System.Numerics.BigInteger.One << -exponent;
            n = System.Numerics.BigInteger.DivRem(scaled, divisor, out var rest);
            if (rest * 2 >= divisor) n += 1;
        }
        var text = n.ToString(CultureInfo.InvariantCulture).PadLeft(digits + 1, '0');
        if (digits > 0) text = text[..^digits] + "." + text[^digits..];
        return negative ? "-" + text : text;
    }

    private static object ListMethod(List<object?> list, string name, object? a0, object? a1)
    {
        switch (name)
        {
            case "join": return string.Join(ReferenceEquals(a0, Undefined) ? "," : Text(a0), list.Select(Text));
            case "includes": return list.Any(item => StrictEquals(item, a0));
            case "indexOf": return (double)list.FindIndex(item => StrictEquals(item, a0));
            case "slice":
            {
                var (from, to) = SliceRange(list.Count, a0, a1);
                return from < to ? list.GetRange(from, to - from) : new List<object?>();
            }
            case "toString": return Text(list);
            default: throw new InvalidOperationException("'" + name + "' is not a list method");
        }
    }

    private static object MathCall(string name, List<object?> args)
    {
        var a0 = args.Count > 0 ? args[0] : Undefined;
        switch (name)
        {
            case "round":
            {
                var d = ToNumber(a0);
                return double.IsNaN(d) || double.IsInfinity(d) ? d : Math.Floor(d + 0.5);
            }
            case "floor": return Math.Floor(ToNumber(a0));
            case "ceil": return Math.Ceiling(ToNumber(a0));
            case "abs": return Math.Abs(ToNumber(a0));
        }
        var min = name == "min";
        var acc = min ? double.PositiveInfinity : double.NegativeInfinity;
        foreach (var a in args)
        {
            var d = ToNumber(a);
            if (double.IsNaN(d)) return double.NaN;
            acc = min ? Math.Min(acc, d) : Math.Max(acc, d);
        }
        return acc;
    }

    /// <summary>JavaScript's ToIntegerOrInfinity, clamped to the int range (NaN → 0).</summary>
    private static long ToInteger(object? v)
    {
        var d = ToNumber(v);
        if (double.IsNaN(d)) return 0;
        return (long)Math.Truncate(Math.Max(int.MinValue, Math.Min(int.MaxValue, d)));
    }

    private static int Clamp(long i, int length) => (int)Math.Max(0, Math.Min(i, length));

    /// <summary><c>slice(start, end)</c>'s range: a negative index counts from the end, then clamped.</summary>
    private static (int From, int To) SliceRange(int length, object? start, object? end)
    {
        var s = ReferenceEquals(start, Undefined) ? 0 : ToInteger(start);
        var e = ReferenceEquals(end, Undefined) ? length : ToInteger(end);
        var from = (int)(s < 0 ? Math.Max(length + s, 0) : Math.Min(s, length));
        var to = (int)(e < 0 ? Math.Max(length + e, 0) : Math.Min(e, length));
        return (from, to);
    }

    private static string Pad(string s, object? length, object? filler, bool start)
    {
        var target = ToInteger(length);
        var fill = ReferenceEquals(filler, Undefined) ? " " : Text(filler);
        if (target <= s.Length || fill.Length == 0) return s;
        if (target > 10_000) throw new InvalidOperationException("pad length");
        var padding = new StringBuilder();
        while (padding.Length < target - s.Length) padding.Append(fill);
        padding.Length = (int)(target - s.Length);
        return start ? padding + s : s + padding;
    }


    // ── JavaScript semantics ─────────────────────────────────────────────────────────────────────

    /// <summary>A state value in this evaluator's terms: JSON scalars become .NET scalars (numbers
    /// as double); objects and arrays stay as they are.</summary>
    private static object? Norm(object? v) => v switch
    {
        JsonElement { ValueKind: JsonValueKind.String } el => el.GetString(),
        JsonElement { ValueKind: JsonValueKind.Number } el => el.GetDouble(),
        JsonElement { ValueKind: JsonValueKind.True } => true,
        JsonElement { ValueKind: JsonValueKind.False } => false,
        JsonElement { ValueKind: JsonValueKind.Null } => null,
        JsonElement { ValueKind: JsonValueKind.Undefined } => Undefined,
        int i => (double)i,
        long l => (double)l,
        float f => (double)f,
        decimal m => (double)m,
        _ => v,
    };

    private static bool IsAbsent(object? v) => v is null || ReferenceEquals(v, Undefined);

    private static object? Apply(string op, object? l, object? r) => op switch
    {
        "??" => IsAbsent(l) ? r : l,
        "||" => Truthy(l) ? l : r,
        "&&" => Truthy(l) ? r : l,
        "==" => LooseEquals(l, r),
        "!=" => !LooseEquals(l, r),
        "===" => StrictEquals(l, r),
        "!==" => !StrictEquals(l, r),
        "<" => Compare(l, r) < 0,
        "<=" => Compare(l, r) <= 0,
        ">" => Compare(l, r) > 0,
        ">=" => Compare(l, r) >= 0,
        "+" => IsStringy(l) || IsStringy(r) ? Text(l) + Text(r) : ToNumber(l) + ToNumber(r),
        "-" => ToNumber(l) - ToNumber(r),
        "*" => ToNumber(l) * ToNumber(r),
        "/" => ToNumber(l) / ToNumber(r),
        "%" => ToNumber(l) % ToNumber(r),
        _ => throw new UnsupportedException("operator " + op),
    };

    private static bool IsStringy(object? v) =>
        v is string or JsonElement { ValueKind: JsonValueKind.Object or JsonValueKind.Array } or IDictionary or IReadOnlyDictionary<string, object?> or IList;

    /// <summary>JavaScript truthiness.</summary>
    public static bool Truthy(object? v) => v switch
    {
        null => false,
        _ when ReferenceEquals(v, Undefined) => false,
        bool b => b,
        double d => d != 0 && !double.IsNaN(d),
        string s => s.Length > 0,
        _ => true,
    };

    private static double ToNumber(object? v)
    {
        switch (Norm(v))
        {
            case null: return 0;
            case var u when ReferenceEquals(u, Undefined): return double.NaN;
            case double d: return d;
            case bool b: return b ? 1 : 0;
        }
        var s = Text(v).Trim();
        if (s.Length == 0) return 0;
        return double.TryParse(s, NumberStyles.Float, CultureInfo.InvariantCulture, out var n) ? n : double.NaN;
    }

    private static bool LooseEquals(object? l, object? r)
    {
        l = Norm(l);
        r = Norm(r);
        var ln = IsAbsent(l);
        var rn = IsAbsent(r);
        if (ln || rn) return ln && rn;
        if (l is double or bool || r is double or bool) return ToNumber(l) == ToNumber(r);
        return Text(l) == Text(r);
    }

    /// <summary><c>===</c>: the same JavaScript type and value (objects by identity; NaN never equal).</summary>
    private static bool StrictEquals(object? l, object? r)
    {
        l = Norm(l);
        r = Norm(r);
        if (ReferenceEquals(l, Undefined) || ReferenceEquals(r, Undefined)) return ReferenceEquals(l, r);
        if (l is null || r is null) return l is null && r is null;
        return (l, r) switch
        {
            (double a, double b) => a == b,
            (string a, string b) => a == b,
            (bool a, bool b) => a == b,
            (double or string or bool, _) => false,
            _ => ReferenceEquals(l, r) || (l is JsonElement && r is JsonElement && Equals(l, r)),
        };
    }

    private static int Compare(object? l, object? r)
    {
        l = Norm(l);
        r = Norm(r);
        if (l is string a && r is string b) return string.CompareOrdinal(a, b);
        return ToNumber(l).CompareTo(ToNumber(r));
    }

    /// <summary>A value as JavaScript's <c>String(v)</c> — what a template literal puts in the text:
    /// null and undefined as nothing (Mateu's rule, on every leg), a list as <c>a,b</c>, a whole number
    /// with no decimals, an object as <c>[object Object]</c>.</summary>
    public static string Text(object? v)
    {
        v = Norm(v);
        return v switch
        {
            null => "",
            _ when ReferenceEquals(v, Undefined) => "",
            string s => s,
            bool b => b ? "true" : "false",
            double d => NumberText(d),
            JsonElement { ValueKind: JsonValueKind.Array } el => string.Join(",", el.EnumerateArray().Select(e => Text(e))),
            JsonElement { ValueKind: JsonValueKind.Object } => "[object Object]",
            IDictionary or IReadOnlyDictionary<string, object?> => "[object Object]",
            IEnumerable items => string.Join(",", items.Cast<object?>().Select(Text)),
            _ => Convert.ToString(v, CultureInfo.InvariantCulture) ?? "",
        };
    }

    private static string NumberText(double d)
    {
        if (double.IsNaN(d)) return "NaN";
        if (double.IsInfinity(d)) return d > 0 ? "Infinity" : "-Infinity";
        if (d == 0) return "0"; // String(-0) is "0" in JavaScript, as Java and Python print it
        if (d == Math.Floor(d) && Math.Abs(d) < 1e21) return d.ToString("F0", CultureInfo.InvariantCulture);
        return d.ToString("R", CultureInfo.InvariantCulture);
    }

    private static string Stringify(object? v)
    {
        try
        {
            v = ReferenceEquals(v, Undefined) ? null : v;
            // compact, as JSON.stringify writes it — GetRawText() would keep the source's whitespace
            return JsonSerializer.Serialize(v);
        }
        catch (Exception)
        {
            return "";
        }
    }

    /// <summary>JavaScript's encodeURIComponent: everything but <c>A-Z a-z 0-9 - _ . ! ~ * ' ( )</c>.</summary>
    public static string EncodeUriComponent(string s)
    {
        var output = new StringBuilder();
        foreach (var b in Encoding.UTF8.GetBytes(s))
        {
            var c = (char)b;
            if (c is >= 'A' and <= 'Z' or >= 'a' and <= 'z' or >= '0' and <= '9' || "-_.!~*'()".Contains(c))
                output.Append(c);
            else
                output.Append('%').Append(b.ToString("X2", CultureInfo.InvariantCulture));
        }
        return output.ToString();
    }
}
