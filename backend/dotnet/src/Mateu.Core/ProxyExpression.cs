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
/// comparisons, <c>== != === !==</c>, <c>&amp;&amp; || ??</c>, <c>?:</c>, parentheses and the calls
/// <c>encodeURIComponent</c>, <c>String</c>, <c>Number</c>, <c>JSON.stringify</c>. <c>data</c>,
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
                if (t == "?." && IsAbsent(value))
                {
                    value = Undefined;
                    continue;
                }
                value = Member(value, name);
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
                throw new UnsupportedException("only encodeURIComponent, String, Number and JSON.stringify can be called");
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
                return name == "length" ? (double)s.Length : Undefined;
            case IList list:
                if (name == "length") return (double)list.Count;
                return int.TryParse(name, NumberStyles.None, CultureInfo.InvariantCulture, out var li) && li < list.Count
                    ? Norm(list[li]) : Undefined;
            default:
                return Undefined;
        }
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
        "==" or "===" => LooseEquals(l, r),
        "!=" or "!==" => !LooseEquals(l, r),
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
