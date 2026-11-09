using System.ComponentModel.DataAnnotations;
using System.Reflection;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

// Page metadata: banners, badges, KPIs, FABs, header extras, width/type (Java: PageMetadataExtractor, PageWidthResolver, PageTypeResolver).
internal sealed partial class ReflectionMapper
{
    /// <summary>Client-side field validations from the bean-validation constraints (mirrors Java's
    /// ConstraintValidationMapper condition for condition and message for message), per field in
    /// Java's order: the length bounds ([StringLength] / [MinLength] / [MaxLength] = Java's @Size, one
    /// entry per declared bound, "Size must be between MIN and MAX"), [Range] (= @Min/@Max, "Must be
    /// at least/at most N"), [RegularExpression] (= @Pattern, "Invalid format"), then [Required]
    /// ("Cannot be empty"). An absent value satisfies every bound but the required one (Bean
    /// Validation's reading). A [Hidden("expr")] field's constraints are relaxed while it is hidden,
    /// as Java's ValidationMapper does. Emitted in field-declaration order.</summary>
    private List<ValidationDto> MapValidations(Type type, IReadOnlyCollection<PropertyInfo>? only = null)
    {
        var validations = new List<ValidationDto>();
        AddValidations(type, only, "", validations, 0);
        return validations;
    }

    /// <summary>The constraints of <paramref name="type"/>'s fields under <paramref name="prefix"/>,
    /// in declaration order; an [Inline] nested object's fields are the page's and are added in place
    /// under the prefixed ids, recursively (Java's ValidationMapper.addFieldValidations). A
    /// non-inline nested object is not descended.</summary>
    private void AddValidations(Type type, IReadOnlyCollection<PropertyInfo>? only, string prefix,
        List<ValidationDto> validations, int depth)
    {
        foreach (var p in EditableProperties(type).Where(p => p is { CanRead: true, CanWrite: true }
                     && (only is null || only.Contains(p))))
        {
            if (IsInlineNestedForm(p))
            {
                if (depth < 8)
                    AddValidations(p.PropertyType, null, prefix + Naming.CamelCase(p.Name) + "-", validations, depth + 1);
                continue;
            }
            var fieldId = prefix + Naming.CamelCase(p.Name);
            var reference = $"state['{fieldId}']";
            var field = new List<ValidationDto>();
            // An absent value satisfies a bound (Bean Validation's reading — requiring it is
            // [Required]'s job), so an optional ranged field left empty passes.
            var absent = $"{reference} == null || {reference} === ''";
            // a length bound HOLDS when the value is valid; an absent value and one with no length
            // (a number) pass — Java's ConstraintValidationMapper.sized, character for character
            var sized = $"{reference} == null || {reference} === '' || {reference}.length === undefined || {reference}.length";
            foreach (var bound in LengthBounds(p))
            {
                if (bound.Min > 0)
                    field.Add(new ValidationDto($"{sized} >= {bound.Min}", fieldId, bound.Message));
                if (bound.Max is { } maxLength)
                    field.Add(new ValidationDto($"{sized} <= {maxLength}", fieldId, bound.Message));
            }
            if (p.GetCustomAttributes(inherit: true)
                    .OfType<System.ComponentModel.DataAnnotations.RangeAttribute>().FirstOrDefault() is { } range)
            {
                // The bounds go into a client EXPRESSION, so they are written invariantly: on a
                // server whose culture uses a decimal comma, [Range(0, double.MaxValue)] became
                // "<= 1,7976931348623157E+308" — not an expression — and Save never left the browser.
                // An open bound (±MaxValue, ±∞) constrains nothing and is not sent.
                if (Bound(range.Minimum) is { } min)
                    field.Add(new ValidationDto(
                        $"{absent} || {reference} >= {min}", fieldId, $"Must be at least {min}"));
                if (Bound(range.Maximum) is { } max)
                    field.Add(new ValidationDto(
                        $"{absent} || {reference} <= {max}", fieldId, $"Must be at most {max}"));
            }
            if (PatternOf(p) is { } pattern)
                field.Add(new ValidationDto(
                    $"{absent} || /{pattern.Regexp}/.test({reference})", fieldId, pattern.Message));
            if (p.GetCustomAttributes(inherit: true)
                    .Any(a => a is System.ComponentModel.DataAnnotations.RequiredAttribute))
                field.Add(new ValidationDto(RequiredCondition(reference), fieldId, "Cannot be empty"));
            if (p.Find<HiddenAttribute>()?.Value is { } hidden && !string.IsNullOrWhiteSpace(hidden))
                field = field.Select(v => v with { Condition = $"({hidden}) || ({v.Condition})" }).ToList();
            validations.AddRange(field.Select(v => v with { Message = T(v.Message) }));
        }
    }

    /// <summary>Java's <c>Integer.MAX_VALUE</c>: what an open maximum reads as in a length message
    /// ("Size must be between 3 and 2147483647"), so the three servers say the same.</summary>
    private const int OpenLength = int.MaxValue;

    /// <summary>A declared length bound: [StringLength(max, MinimumLength = min)], [MinLength(min)],
    /// [MaxLength(max)] — Java's @Size(min, max). <c>Max</c> is null for an open maximum.</summary>
    private sealed record LengthBound(int Min, int? Max, string Message);

    private static List<LengthBound> LengthBounds(PropertyInfo p)
    {
        var bounds = new List<LengthBound>();
        foreach (var a in p.GetCustomAttributes(inherit: true))
        {
            int min;
            int? max;
            switch (a)
            {
                case StringLengthAttribute s:
                    (min, max) = (s.MinimumLength, s.MaximumLength);
                    break;
                case MinLengthAttribute m:
                    (min, max) = (m.Length, null);
                    break;
                // [MaxLength] without a length (-1) is the database's "as long as it gets": no bound
                case MaxLengthAttribute m:
                    (min, max) = (0, m.Length < 0 ? null : m.Length);
                    break;
                default:
                    continue;
            }
            min = Math.Max(min, 0);
            if (max is OpenLength) max = null;
            if (min == 0 && max is null) continue;
            bounds.Add(new LengthBound(min, max,
                MessageOf((ValidationAttribute)a, p, $"Size must be between {min} and {max ?? OpenLength}")));
        }
        return bounds;
    }

    /// <summary>A declared [RegularExpression] (Java's @Pattern): the regexp as written — the
    /// browser evaluates it with RegExp.test too, so it must be JavaScript-compatible — and its
    /// message ("Invalid format" by default).</summary>
    private sealed record PatternConstraint(string Regexp, string Message);

    private static PatternConstraint? PatternOf(PropertyInfo p) =>
        p.GetCustomAttributes(inherit: true).OfType<RegularExpressionAttribute>().FirstOrDefault() is { } r
            ? new PatternConstraint(r.Pattern, MessageOf(r, p, "Invalid format"))
            : null;

    /// <summary>A constraint's message: its ErrorMessage when declared (formatted the .NET way,
    /// <c>{0}</c> = the field's label), else Java's default text.</summary>
    private static string MessageOf(ValidationAttribute attribute, PropertyInfo p, string fallback)
    {
        if (string.IsNullOrEmpty(attribute.ErrorMessage)) return fallback;
        try
        {
            return attribute.FormatErrorMessage(p.Find<LabelAttribute>()?.Value ?? Naming.Humanize(p.Name));
        }
        catch (FormatException)
        {
            return attribute.ErrorMessage;
        }
    }

    /// <summary>A required field holds a value: not null, not a cleared input, not an empty list —
    /// while 0 and false ARE values (a bare <c>state['x']</c> rejected both). Java's
    /// ConstraintValidationMapper.required, character for character.</summary>
    internal static string RequiredCondition(string reference) =>
        $"{reference} != null && {reference} !== '' && ({reference}.length === undefined || {reference}.length > 0)";

    /// <summary>The title the client gives its own validation toast (Java's ServerConstraintCheck.TITLE).</summary>
    public const string ValidationTitle = "There are validation errors";

    /// <summary>The server's own check of the constraints <see cref="MapValidations"/> sends the
    /// client — same properties, same messages: "• Label: message" per broken one, empty when the
    /// instance is valid. Run before a [Button] action (advertised validationRequired), because the
    /// browser is not to be trusted, nor the only client.</summary>
    internal List<string> Violations(Type type, object instance) =>
        BrokenConstraints(type, instance)
            .Select(b => $"• {T(b.Property.Find<LabelAttribute>()?.Value ?? Naming.Humanize(b.Property.Name))}: {T(b.Message)}")
            .ToList();

    /// <summary>"Label: message" for every length / range / pattern constraint a CRUD record breaks,
    /// over the properties its form renders (<paramref name="mode"/> "new" | "edit": a
    /// [HiddenInCreate] / [HiddenInEditor] field sent no validation, so it is not checked) — the
    /// server-side leg of a crud save and of an inline-edited row (Java's FilteredAutoCrud.save /
    /// updateRow → ServerConstraintCheck). [Required] is reported separately by the caller.</summary>
    internal List<string> CrudConstraintViolations(Type element, object entity, string mode) =>
        BrokenConstraints(element, entity, p => !HiddenInForm(p, mode), includeRequired: false)
            .Select(b => $"{T(b.Property.Find<LabelAttribute>()?.Value ?? Naming.Humanize(b.Property.Name))}: {T(b.Message)}")
            .ToList();

    /// <summary>The constraints the instance breaks, in Java's ServerConstraintCheck order per field
    /// (required, length, range, pattern). A [Hidden("expr")] field is the browser's to judge and is
    /// skipped; an absent optional value (null, or a blank input) satisfies every bound.</summary>
    private static List<(PropertyInfo Property, string Message)> BrokenConstraints(Type type, object instance,
        Func<PropertyInfo, bool>? include = null, bool includeRequired = true)
    {
        var broken = new List<(PropertyInfo, string)>();
        AddViolations(type, instance, broken, 0, include, includeRequired);
        return broken;
    }

    /// <summary>The broken constraints of <paramref name="instance"/>, an [Inline] nested object's
    /// fields checked with the page (with their own labels; a fresh object when the field is null),
    /// recursively (Java's ServerConstraintCheck.check).</summary>
    private static void AddViolations(Type type, object instance, List<(PropertyInfo, string)> broken, int depth,
        Func<PropertyInfo, bool>? include, bool includeRequired)
    {
        var invariant = System.Globalization.CultureInfo.InvariantCulture;
        foreach (var p in EditableProperties(type).Where(p => p is { CanRead: true, CanWrite: true }))
        {
            if (include is not null && !include(p)) continue;
            if (p.Find<HiddenAttribute>()?.Value is { } hidden && !string.IsNullOrWhiteSpace(hidden)) continue;
            if (IsInlineNestedForm(p))
            {
                if (depth < 8)
                {
                    var nested = p.GetValue(instance) ?? Activator.CreateInstance(p.PropertyType)!;
                    AddViolations(nested.GetType(), nested, broken, depth + 1, include, includeRequired);
                }
                continue;
            }
            var value = p.GetValue(instance);
            var absent = value is null || value is string { Length: 0 }
                         || (value is System.Collections.ICollection { Count: 0 });
            if (includeRequired && absent && p.GetCustomAttributes(inherit: true)
                    .Any(a => a is RequiredAttribute))
                broken.Add((p, "Cannot be empty"));
            // what the client calls absent: null or a cleared input (an empty list still has a length)
            if (value is null || value is string { Length: 0 }) continue;
            var length = value switch
            {
                string text => text.Length,
                Array array => array.Length,
                System.Collections.ICollection collection => collection.Count,
                _ => -1,
            };
            if (length >= 0)
                foreach (var bound in LengthBounds(p))
                    if ((bound.Min > 0 && length < bound.Min) || (bound.Max is { } maxLength && length > maxLength))
                        broken.Add((p, bound.Message));
            if (!absent && value is IConvertible
                && p.GetCustomAttributes(inherit: true).OfType<RangeAttribute>().FirstOrDefault() is { } range)
            {
                var number = Convert.ToDouble(value, invariant);
                // the same literals the client got (Bound): an open bound constrains nothing
                if (Bound(range.Minimum) is { } min && number < double.Parse(min, invariant))
                    broken.Add((p, $"Must be at least {min}"));
                if (Bound(range.Maximum) is { } max && number > double.Parse(max, invariant))
                    broken.Add((p, $"Must be at most {max}"));
            }
            // a FIND, not a full match: the client tests the same regexp with JS RegExp.test (Java's
            // ServerConstraintCheck uses Matcher.find for the same reason); a regexp that runs away
            // counts as not matching rather than holding the request
            if (value is string text2 && PatternOf(p) is { } pattern)
            {
                bool matches;
                try
                {
                    matches = System.Text.RegularExpressions.Regex.IsMatch(text2, pattern.Regexp,
                        System.Text.RegularExpressions.RegexOptions.None, TimeSpan.FromSeconds(1));
                }
                catch (System.Text.RegularExpressions.RegexMatchTimeoutException)
                {
                    matches = false;
                }
                if (!matches) broken.Add((p, pattern.Message));
            }
        }
    }

    /// <summary>A [Range] bound as an invariant number literal, or null for an open bound.</summary>
    private static string? Bound(object? value)
    {
        if (value is null) return null;
        var d = System.Convert.ToDouble(value, System.Globalization.CultureInfo.InvariantCulture);
        if (double.IsInfinity(d) || double.IsNaN(d) || d >= double.MaxValue || d <= double.MinValue
            || d >= int.MaxValue && value is int || d <= int.MinValue && value is int)
            return null;
        return d.ToString("R", System.Globalization.CultureInfo.InvariantCulture);
    }

    /// <summary>Client-side rules of a view (mirrors Java's RuleMapper.createRules): [Disabled]
    /// fields disable unconditionally, [Hidden(expr)] fields hide while the expression is truthy,
    /// and an IRuleSupplier contributes programmatic rules.</summary>
    internal List<RuleDto> MapRules(Type type, object? instance)
    {
        var rules = new List<RuleDto>();
        foreach (var p in EditableProperties(type))
        {
            var fieldId = Naming.CamelCase(p.Name);
            if (p.Find<DisabledAttribute>() != null
                || !Authorized(p.Find<DisabledUnlessAttribute>()))
                rules.Add(new RuleDto("true", "SetDataValue", fieldId, "disabled", null, "true", "Continue", null));
            if (p.Find<HiddenAttribute>() is { } hidden)
                rules.Add(new RuleDto("true", "SetDataValue", fieldId, "hidden", null,
                    string.IsNullOrWhiteSpace(hidden.Value) ? "true" : hidden.Value, "Continue", null));
        }
        if (instance is IRuleSupplier supplier)
            rules.AddRange(supplier.Rules().Select(r => new RuleDto(
                r.Filter, r.Action, r.FieldName, r.FieldAttribute, r.Value, r.Expression, r.Result, r.ActionId)));
        return rules;
    }

    private static List<BannerDto> Banners(Type type, object instance) =>
        type.GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
            .Where(m => m.Find<BannerAttribute>() != null)
            .Select(m =>
            {
                var a = m.Find<BannerAttribute>()!;
                var desc = m.ReturnType == typeof(string) ? m.Invoke(instance, [])?.ToString() : null;
                return new BannerDto(a.Theme.ToString().ToUpperInvariant(), a.Title, desc);
            })
            .ToList();

    private static List<BadgeDto> Badges(Type type, object instance) =>
        EditableProperties(type)
            .Where(p => p.Find<HeaderBadgeAttribute>() != null)
            .Select(p => (text: HeaderBadgeText(p, instance), color: p.Find<HeaderBadgeAttribute>()!.Color))
            .Where(x => !string.IsNullOrWhiteSpace(x.text))
            .Select(x => new BadgeDto(x.text!, x.color))
            .ToList();

    /// <summary>A [HeaderBadge] chip's text (Java's @BadgeInHeader): a bool shows its label while
    /// true and nothing while false; anything else shows its value.</summary>
    private static string? HeaderBadgeText(PropertyInfo p, object instance)
    {
        var value = p.GetValue(instance);
        if ((Nullable.GetUnderlyingType(p.PropertyType) ?? p.PropertyType) != typeof(bool))
            return value?.ToString();
        if (value is not true) return null;
        var label = p.Find<HeaderBadgeAttribute>()!.Label;
        return string.IsNullOrWhiteSpace(label)
            ? p.Find<LabelAttribute>()?.Value ?? Naming.Humanize(p.Name)
            : label;
    }

    /// <summary>KPI cards for the page header (mirrors Java's PageMetadataExtractor.getKpis): from
    /// [Kpi] methods (the title is the attribute, the value is the call result) AND from [Kpi]
    /// properties (the property value is the text; the property is hoisted out of the form body).</summary>
    private static List<KpiDto> Kpis(Type type, object instance)
    {
        var fromFields = EditableProperties(type)
            .SelectMany(p => p.FindAll<KpiAttribute>()
                .Select(k => new KpiDto(k.Title, p.GetValue(instance)?.ToString() ?? "")));
        var fromMethods = type.GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
            .Where(m => m.GetParameters().Length == 0)
            .SelectMany(m =>
            {
                var kpis = m.FindAll<KpiAttribute>();
                if (kpis.Count == 0) return [];
                var value = m.Invoke(instance, [])?.ToString() ?? "";
                return kpis.Select(k => new KpiDto(k.Title, value));
            });
        return fromFields.Concat(fromMethods).ToList();
    }

    /// <summary>Floating action buttons from [Fab] methods (the method name is the action id).</summary>
    private List<FabDto> Fabs(Type type) =>
        type.GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
            .Where(m => m.Find<FabAttribute>() != null && Authorized(m.Find<EyesOnlyAttribute>()))
            .Select(m =>
            {
                var a = m.Find<FabAttribute>()!;
                return new FabDto(a.Icon, Naming.CamelCase(m.Name))
                {
                    Label = a.Label, Order = a.Order, ButtonStyle = "primary",
                };
            })
            .OrderBy(f => f.Order)
            .ToList();

    /// <summary>The view's [WelcomeBanner], when declared. Inherited from a base class (the Java
    /// annotation is @Inherited), so the lookup walks the base-type chain like PageTypeOf does.</summary>
    private static WelcomeBannerAttribute? WelcomeBannerOf(Type type)
    {
        for (var t = type; t is not null; t = t.BaseType)
            if (t.Find<WelcomeBannerAttribute>() is { } banner) return banner;
        return null;
    }

    /// <summary>The view's declared page width as its wire name (fixed|fullWidth|edgeToEdge — the
    /// lowercase-camel Java enum names), or null when neither [PageWidth] on the class nor the
    /// IPageWidthSupplier hook says anything (the renderer then infers the width from the page
    /// content). The attribute on the concrete view wins over the hook (mirrors Java's
    /// PageWidthResolver).</summary>
    /// <summary>Previous/next peer-object arrows from an IPeerNavigationSupplier, as the wire DTO;
    /// null when the page supplies none (mirrors Java's PageMetadataExtractor.getPeerNav).</summary>
    /// <summary>The breadcrumb trail the page declares: an IBreadcrumbsSupplier wins over its
    /// [Breadcrumb] attributes; null when it declares none (mirrors Java's
    /// PageSectionExtractor.getBreadcrumbs → PageMapper).</summary>
    internal static IReadOnlyList<BreadcrumbDto>? BreadcrumbsOf(Type type, object? instance)
    {
        if (instance is IBreadcrumbsSupplier supplier)
            return supplier.Breadcrumbs()?.Select(b => new BreadcrumbDto(b.Text, b.Link)).ToList();
        var declared = type.GetCustomAttributes<BreadcrumbAttribute>().ToList();
        return declared.Count > 0 ? declared.Select(b => new BreadcrumbDto(b.Label, b.Url)).ToList() : null;
    }

    internal static PeerNavDto? PeerNavOf(object? instance)
    {
        if ((instance as IPeerNavigationSupplier)?.Peers() is { } p)
            return new PeerNavDto(p.PrevLabel, p.PrevRoute, p.NextLabel, p.NextRoute);
        return null;
    }

    /// <summary>The header's record/context switcher from an IRecordSwitcherSupplier, as the wire
    /// DTO; null when the page supplies none (mirrors Java's PageMapper.mapSwitcher).</summary>
    internal static RecordSwitcherDto? SwitcherOf(object? instance)
    {
        if ((instance as IRecordSwitcherSupplier)?.Switcher() is not { } s) return null;
        return new RecordSwitcherDto(
            (s.Options ?? []).Select(MapOption).ToList(), s.Value,
            s.Type == SwitcherType.Context ? "context" : "object",
            s.Label, s.Searchable, s.Disabled, IRecordSwitcherSupplier.ActionId);
    }

    /// <summary>The page's "last updated" timestamp from the first [Timestamp] property (an
    /// optional label prefix + the value's ToString()); null when there is no such property or its
    /// value is null (mirrors Java's PageMetadataExtractor.getTimestamp).</summary>
    internal static string? TimestampOf(Type type, object? instance)
    {
        foreach (var p in type.GetProperties(BindingFlags.Public | BindingFlags.Instance))
        {
            if (p.Find<Mateu.Uidl.TimestampAttribute>() is not { } attr) continue;
            var value = p.GetValue(instance);
            if (value is null) return null;
            return string.IsNullOrWhiteSpace(attr.Label) ? value.ToString() : $"{attr.Label} {value}";
        }
        return null;
    }

    internal static string? PageWidthOf(Type type, object? instance)
    {
        var style = type.Find<PageWidthAttribute>()?.Value
                    ?? (instance as IPageWidthSupplier)?.PageWidth();
        return style switch
        {
            PageWidthStyle.Fixed => "fixed",
            PageWidthStyle.FullWidth => "fullWidth",
            PageWidthStyle.EdgeToEdge => "edgeToEdge",
            _ => null,
        };
    }

    /// <summary>The wire sizing string for a view's [Size] (coherence-plan #8): "hug" | "fill" |
    /// "fixed:&lt;len&gt;", or null when absent.</summary>
    internal static string? SizingOf(Type type)
    {
        var size = type.Find<SizeAttribute>();
        return size?.Value switch
        {
            SizeMode.Hug => "hug",
            SizeMode.Fill => "fill",
            SizeMode.Fixed => "fixed:" + size!.Length,
            _ => null,
        };
    }

    /// <summary>The view's coarse page type (the Redwood page-template families) as its wire name
    /// (landing|collection|detail|form|process|dashboard — the lowercase Java enum names). Never
    /// null: every page gets a type. The explicit [PageTemplate] on the view class (inherited from
    /// a base class) wins; otherwise the type is inferred from the ModelView's shape — archetypes
    /// map to their family, a Crud/Listing is a collection page, a view with MetricCard fields is
    /// a dashboard, and a plain reflected form is a form page. (Mirrors Java's
    /// PageTypeResolver.)</summary>
    internal static string PageTypeOf(Type type)
    {
        for (var t = type; t is not null; t = t.BaseType)
            if (t.Find<PageTemplateAttribute>() is { } template)
                return template.Value.ToString().ToLowerInvariant();
        if (typeof(Dashboard).IsAssignableFrom(type)) return "dashboard";
        if (typeof(Welcome).IsAssignableFrom(type)) return "landing";
        if (DerivesFrom(type, typeof(HeroSearch<>))) return "landing";
        if (DerivesFrom(type, typeof(HeroSearch<,>))) return "landing";
        if (DerivesFrom(type, typeof(SmartSearchPage<,>))) return "collection";
        if (DerivesFrom(type, typeof(TodoList<>))) return "collection";
        if (typeof(CalendarPage).IsAssignableFrom(type)) return "collection";
        if (DerivesFrom(type, typeof(CollectionDetail<>))) return "collection";
        if (typeof(Wizard).IsAssignableFrom(type)) return "process";
        if (typeof(Foldout).IsAssignableFrom(type)) return "detail";
        if (typeof(GanttPage).IsAssignableFrom(type)) return "detail";
        if (typeof(DataManagement).IsAssignableFrom(type)) return "collection";
        if (typeof(ItemOverview).IsAssignableFrom(type)) return "detail";
        if (DerivesFrom(type, typeof(GeneralOverview<>))) return "detail";
        if (CrudElementType(type) is not null) return "collection";
        if (ListingTypes(type) is not null) return "collection";
        // A capability listing (IListing + declared capabilities) is a collection page too.
        if (type.GetInterfaces().Any(i => i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IListing<>)))
            return "collection";
        if (type.GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .Any(p => p.PropertyType == typeof(MetricCard))) return "dashboard";
        // Page-level inference renders this class as the Welcome landing ([AutoPage]).
        if (PageInference.ComposesWelcome(type)) return "landing";
        return "form";
    }

    /// <summary>Whether <paramref name="type"/> derives from the generic base class
    /// <paramref name="genericBase"/> (an open generic type definition like Crud&lt;&gt;).</summary>
    private static bool DerivesFrom(Type type, Type genericBase)
    {
        for (var t = type; t is not null; t = t.BaseType)
            if (t.IsGenericType && t.GetGenericTypeDefinition() == genericBase)
                return true;
        return false;
    }
}
