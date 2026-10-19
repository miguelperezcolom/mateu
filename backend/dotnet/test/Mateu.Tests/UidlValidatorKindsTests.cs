using Mateu.Core.Authoring;
using Xunit;

namespace Mateu.Tests;

// Every file kind the validator recognises without a `type:` key, plus the roots it cannot classify:
// a definition must be told apart by its shape, or its schema branch is never chosen.
public class UidlValidatorKindsTests
{
    [Theory]
    [InlineData("content:\n  - type: Text\n    text: hi\n", "partial")]
    [InlineData("components:\n  - name: card\n    component:\n      type: Text\n      text: hi\n", "components")]
    [InlineData("routes:\n  - route: home\n    layout: home.yaml\n", "routes")]
    [InlineData("actions:\n  - id: go\n", "actions")]
    [InlineData("types:\n  - name: money\n    dataType: number\n", "types")]
    [InlineData("messages:\n  hello: Hola\n", "translations")]
    [InlineData("sources:\n  - name: countries\n    source:\n      url: /c\n", "sources")]
    [InlineData("sources:\n  countries:\n    baseUrl: https://example.com\n", "environment")]
    [InlineData("- route: home\n  layout: home.yaml\n", "routes")]
    public void A_typeless_definition_is_classified_by_its_shape(string yaml, string kind)
    {
        var report = UidlValidator.Default.Validate(yaml);
        Assert.Equal(kind, (string?)report["kind"]);
    }

    [Theory]
    [InlineData("just a scalar\n")]
    [InlineData("foo: bar\n")]
    public void A_root_that_is_no_known_kind_is_reported(string yaml)
    {
        var report = UidlValidator.Default.Validate(yaml);
        Assert.False((bool)report["valid"]!);
        Assert.NotEmpty(report["errors"]!.AsArray());
    }

    [Theory]
    [InlineData("")]
    [InlineData("~\n")]
    public void An_empty_document_is_reported_as_empty(string yaml)
    {
        var errors = UidlValidator.Default.Validate(yaml)["errors"]!.AsArray();
        Assert.Contains(errors, e => (string?)e!["code"] == "empty");
    }
}
