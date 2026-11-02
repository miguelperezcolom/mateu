using System.Text.Json;
using System.Text.Json.Nodes;
using Mateu.Core;
using Xunit;

namespace Mateu.Tests;

/// <summary>
/// The proxied leg's expression evaluator (<see cref="ProxyExpression"/>) beyond the shared corpus:
/// the JavaScript semantics a source template relies on when the server, not the browser, fills it —
/// operators and their short-circuits, optional chaining, member access on every value shape the state
/// carries (JSON or .NET collections), the calls, and what stays outside the subset.
/// </summary>
public class ProxyExpressionTests
{
    private static IReadOnlyDictionary<string, object?> Json(string json) =>
        JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(json)!
            .ToDictionary(kv => kv.Key, kv => (object?)kv.Value);

    private static readonly IReadOnlyDictionary<string, object?> State = Json("""
        {"n": 3, "zero": 0, "s": "abc", "empty": "", "t": true, "f": false, "nil": null,
         "list": [10, 20, 30], "obj": {"a": {"b": 7}, "name": "x"}, "words": ["a", "b"]}
        """);

    private static string Eval(string expression, IReadOnlyDictionary<string, object?>? state = null,
        Func<string, string?>? secrets = null) =>
        ProxyExpression.Text(ProxyExpression.Evaluate(expression, state ?? State, secrets));

    [Theory]
    // unary operators
    [InlineData("!state.t", "false")]
    [InlineData("!state.zero", "true")]
    [InlineData("!!state.s", "true")]
    [InlineData("-state.n", "-3")]
    [InlineData("+state.t", "1")]
    [InlineData("+'4.5'", "4.5")]
    [InlineData("+'x'", "NaN")]
    [InlineData("+''", "0")]
    [InlineData("-state.nil", "0")]
    // arithmetic
    [InlineData("state.n % 2", "1")]
    [InlineData("7 - 2 - 1", "4")]
    [InlineData("1 / 0", "Infinity")]
    [InlineData("-1 / 0", "-Infinity")]
    [InlineData("state.missing * 2", "NaN")]
    [InlineData(".5 + .25", "0.75")]
    [InlineData("state.list + ''", "10,20,30")]
    [InlineData("state.obj + ''", "[object Object]")]
    // comparisons, strings compare ordinally
    [InlineData("state.n < 4", "true")]
    [InlineData("state.n <= 3", "true")]
    [InlineData("state.n > 3", "false")]
    [InlineData("state.n >= 4", "false")]
    [InlineData("'b' > 'a'", "true")]
    [InlineData("'10' < '9'", "true")]
    // loose equality: numbers and booleans by value, strings as text, null == undefined only
    [InlineData("state.n == '3'", "true")]
    [InlineData("state.t == 1", "true")]
    [InlineData("state.s != 'abc'", "false")]
    [InlineData("state.nil == 0", "false")]
    [InlineData("state.missing == null", "true")]
    // strict equality: the same type and value
    [InlineData("state.t === 1", "false")]
    [InlineData("state.n === 3", "true")]
    [InlineData("state.n === '3'", "false")]
    [InlineData("state.n !== '3'", "true")]
    [InlineData("state.s !== 'abd'", "true")]
    [InlineData("state.s === 'abc'", "true")]
    [InlineData("state.nil === undefined", "false")]
    [InlineData("state.missing === undefined", "true")]
    [InlineData("state.missing === null", "false")]
    // number literals with an exponent, a string's characters
    [InlineData("1e3", "1000")]
    [InlineData("2.5E-1 * 4", "1")]
    [InlineData("state.s[0]", "a")]
    [InlineData("state.s[9]", "")]
    // allow-listed methods and Math
    [InlineData("state.s.toUpperCase()", "ABC")]
    [InlineData("'  x '.trim()", "x")]
    [InlineData("state.s.includes('b')", "true")]
    [InlineData("state.s.startsWith('ab') && state.s.endsWith('c')", "true")]
    [InlineData("state.s.indexOf('c')", "2")]
    [InlineData("state.s.slice(-2)", "bc")]
    [InlineData("state.s.slice(2, 1)", "")]
    [InlineData("state.s.substring(2, 0)", "ab")]
    [InlineData("state.s.substring(1)", "bc")]
    [InlineData("'7'.padStart(3, '0')", "007")]
    [InlineData("'7'.padEnd(3)", "7  ")]
    [InlineData("'abc'.padStart(2)", "abc")]
    [InlineData("state.s.toString()", "abc")]
    [InlineData("(2.345).toFixed(2)", "2.35")]
    [InlineData("(-2.345).toFixed(2)", "-2.35")]
    [InlineData("(1.005).toFixed(2)", "1.00")]
    [InlineData("(3).toFixed()", "3")]
    [InlineData("state.n.toString()", "3")]
    [InlineData("state.t.toString()", "true")]
    [InlineData("state.words.join('|')", "a|b")]
    [InlineData("state.words.join()", "a,b")]
    [InlineData("state.list.includes(20)", "true")]
    [InlineData("state.list.indexOf(30)", "2")]
    [InlineData("state.list.indexOf(99)", "-1")]
    [InlineData("state.list.slice(1)", "20,30")]
    [InlineData("state.list.toString()", "10,20,30")]
    [InlineData("Math.round(2.5) + Math.round(-2.5)", "1")]
    [InlineData("Math.floor(2.7) + Math.ceil(2.1) + Math.abs(-1)", "6")]
    [InlineData("Math.max(state.missing ?? 0, 1)", "1")]
    [InlineData("Math.min(3, 1, 2)", "1")]
    [InlineData("Math.max(1, 'x')", "NaN")]
    [InlineData("state.missing?.toLowerCase() ?? 'none'", "none")]
    [InlineData("state.t ? 'y' : state.missing.toLowerCase()", "y")]
    // || && ?? return a side, not a boolean
    [InlineData("state.empty || 'fallback'", "fallback")]
    [InlineData("state.s || 'fallback'", "abc")]
    [InlineData("state.s && state.n", "3")]
    [InlineData("state.zero && state.n", "0")]
    [InlineData("state.zero ?? 9", "0")]
    [InlineData("state.nil ?? state.missing ?? 'last'", "last")]
    // ternary and precedence
    [InlineData("state.t ? 'y' : 'n'", "y")]
    [InlineData("state.f ? 'y' : state.n > 2 ? 'big' : 'small'", "big")]
    [InlineData("(1 + 2) * 3", "9")]
    // literals and strings with escapes
    [InlineData("true", "true")]
    [InlineData("false || 'no'", "no")]
    [InlineData("null", "")]
    [InlineData("undefined", "")]
    [InlineData("\"it\\'s\"", "it's")]
    [InlineData("'a\\tb'", "a\tb")]
    // member access on JSON objects and arrays
    [InlineData("state.obj.a.b", "7")]
    [InlineData("state.obj['name']", "x")]
    [InlineData("state.list[1]", "20")]
    [InlineData("state.list[9]", "")]
    [InlineData("state.list.length", "3")]
    [InlineData("state.s.length", "3")]
    [InlineData("state.s.other", "")]
    [InlineData("state.n.toFixed", "")]
    // optional chaining stops at null/undefined
    [InlineData("state.missing?.deep", "")]
    [InlineData("state.nil?.[0]", "")]
    [InlineData("state.list?.[0]", "10")]
    [InlineData("state.obj?.a?.b", "7")]
    // a bare name reads the state; data/appState/appData exist only in the browser
    [InlineData("n * 2", "6")]
    [InlineData("data", "")]
    [InlineData("appState", "")]
    // the calls
    [InlineData("String(state.n)", "3")]
    [InlineData("Number('12') + 1", "13")]
    [InlineData("encodeURIComponent('a/b?c=d & é')", "a%2Fb%3Fc%3Dd%20%26%20%C3%A9")]
    [InlineData("JSON.stringify(state.words)", """["a","b"]""")]
    [InlineData("JSON.stringify(undefined)", "null")]
    public void Evaluates_like_JavaScript(string expression, string expected) =>
        Assert.Equal(expected, Eval(expression));

    [Fact]
    public void The_branch_not_taken_is_never_evaluated()
    {
        // reading through null throws when evaluated; skipped, it must not
        Assert.Equal("safe", Eval("state.t ? 'safe' : state.nil.boom"));
        Assert.Equal("safe", Eval("state.f ? state.nil.boom : 'safe'"));
        Assert.Equal("abc", Eval("state.s || state.nil.boom"));
        Assert.Equal("0", Eval("state.zero && state.nil.boom"));
        Assert.Equal("3", Eval("state.n ?? state.nil.boom"));
        Assert.Equal("ok", Eval("state.t ? 'ok' : encodeURIComponent(state.nil.boom)"));
    }

    [Fact]
    public void Reading_through_null_is_an_error_not_unsupported_syntax()
    {
        Assert.Throws<InvalidOperationException>(() => ProxyExpression.Evaluate("state.nil.x", State, null));
        // the validator only rejects SYNTAX: a runtime error against the empty state still parses
        Assert.True(ProxyExpression.IsSupported("state.a.b.c"));
    }

    [Theory]
    [InlineData("state.items.map(i => i.id)")]
    [InlineData("JSON.parse('{}')")]
    [InlineData("'unterminated")]
    [InlineData("state.a = 1")]
    [InlineData("state.x.'y'")]
    [InlineData("state.x.1")]
    [InlineData("1 2")]
    [InlineData("(1 + 2")]
    [InlineData("state.t ? 1")]
    [InlineData("1.2.3")]
    [InlineData("")]
    [InlineData("#")]
    [InlineData("* 2")]
    public void Outside_the_subset_is_unsupported(string expression)
    {
        Assert.False(ProxyExpression.IsSupported(expression));
        Assert.Throws<ProxyExpression.UnsupportedException>(() => ProxyExpression.Evaluate(expression, State, null));
    }

    [Theory]
    [InlineData("state.s.split(',')")]
    [InlineData("state.s.replace('a', 'b')")]
    [InlineData("Math.random()")]
    [InlineData("state.s.slice(1 2)")]
    public void A_call_outside_the_allow_list_is_unsupported(string expression)
    {
        Assert.False(ProxyExpression.IsSupported(expression));
        Assert.Throws<ProxyExpression.UnsupportedException>(() => ProxyExpression.Evaluate(expression, State, null));
    }

    [Theory]
    [InlineData("state.missing.toLowerCase()")]
    [InlineData("state.t.trim()")]
    [InlineData("state.n.toFixed(101)")]
    public void A_method_of_nothing_or_of_the_wrong_value_is_a_runtime_error(string expression) =>
        Assert.Throws<InvalidOperationException>(() => ProxyExpression.Evaluate(expression, State, null));

    [Fact]
    public void A_conditional_with_a_decimal_is_not_optional_chaining() =>
        Assert.Equal("0.5", Eval("state.t ?.5 : 1"));

    [Fact]
    public void Secrets_come_only_from_the_server_and_only_through_the_secret_root()
    {
        Assert.Equal("k-API", Eval("secret.API", secrets: name => "k-" + name));
        Assert.Equal("k-API", Eval("secret['API']", secrets: name => "k-" + name));
        Assert.Equal("", Eval("secret.API"));
    }

    [Fact]
    public void Dotnet_state_values_behave_like_their_JSON_twins()
    {
        IReadOnlyDictionary<string, object?> state = new Dictionary<string, object?>
        {
            ["i"] = 2,
            ["l"] = 3L,
            ["f"] = 1.5f,
            ["m"] = 2.5m,
            ["list"] = new List<object?> { "a", 1, null },
            ["map"] = new Dictionary<string, object?> { ["k"] = "v" },
            ["ro"] = (IReadOnlyDictionary<string, object?>)new Dictionary<string, object?> { ["k"] = 4 },
            ["el"] = JsonDocument.Parse("""[true, false, null]""").RootElement,
        };
        Assert.Equal("5", Eval("i + l", state));
        Assert.Equal("4", Eval("f + m", state));
        Assert.Equal("3", Eval("list.length", state));
        Assert.Equal("a", Eval("list[0]", state));
        Assert.Equal("", Eval("list[7]", state));
        Assert.Equal("a,1,", Eval("list + ''", state));
        Assert.Equal("v", Eval("map.k", state));
        Assert.Equal("", Eval("map.none", state));
        Assert.Equal("[object Object]", Eval("map + ''", state));
        Assert.Equal("4", Eval("ro.k", state));
        Assert.Equal("true", Eval("el[0]", state));
        Assert.Equal("false", Eval("el[1]", state));
        Assert.Equal("", Eval("el[2]", state));
        Assert.Equal("true,false,", Eval("el + ''", state));
        Assert.Equal("""{"k":"v"}""", Eval("JSON.stringify(map)", state));
    }

    [Fact]
    public void A_dynamic_object_and_other_values_read_as_the_browser_would()
    {
        dynamic expando = new System.Dynamic.ExpandoObject();
        expando.city = "Palma";
        var id = Guid.Parse("6f1c3e2a-1b2c-4d5e-8f90-112233445566");
        IReadOnlyDictionary<string, object?> state = new Dictionary<string, object?>
        {
            // an ExpandoObject is an IDictionary but not an IReadOnlyDictionary
            ["place"] = (object)expando,
            ["id"] = id,
        };
        Assert.Equal("Palma", Eval("place.city", state));
        Assert.Equal("", Eval("place.zip", state));
        Assert.Equal(id.ToString(), Eval("String(id)", state));
    }

    [Fact]
    public void A_whole_number_has_no_decimals_and_a_fraction_keeps_them() =>
        Assert.Equal("3 0.1", Eval("String(3.0) + ' ' + String(0.1)"));

    [Fact]
    public void Truthiness_follows_JavaScript()
    {
        Assert.False(ProxyExpression.Truthy(null));
        Assert.False(ProxyExpression.Truthy(ProxyExpression.Undefined));
        Assert.False(ProxyExpression.Truthy(double.NaN));
        Assert.False(ProxyExpression.Truthy(""));
        Assert.True(ProxyExpression.Truthy(new List<object>()));
        Assert.Equal("undefined", ProxyExpression.Undefined.ToString());
    }

    [Fact]
    public void Url_templates_read_dotnet_state_the_same_way()
    {
        IReadOnlyDictionary<string, object?> state = new Dictionary<string, object?>
        {
            ["price"] = new Dictionary<string, object?> { ["value"] = 12.5, ["currency"] = "EUR" },
            ["tags"] = new List<object?> { "red", "blue" },
            ["nested"] = new Dictionary<string, object?> { ["id"] = "7" },
        };
        Assert.Equal("12.5", UrlTemplate.ValueOf("state.price", state, _ => null));
        Assert.Equal("red%2Cblue", UrlTemplate.ValueOf("encodeURIComponent(state.tags)", state, _ => null));
        Assert.Equal("7", UrlTemplate.ValueOf("state.nested.id", state, _ => null));
        Assert.Equal("", UrlTemplate.ValueOf("state.nested.none", state, _ => null));
        var json = Json("""{"price": {"value": 3, "currency": "USD"}}""");
        Assert.Equal("3", UrlTemplate.ValueOf("state.price", json, _ => null));
        _ = JsonNode.Parse("{}");
    }
}
