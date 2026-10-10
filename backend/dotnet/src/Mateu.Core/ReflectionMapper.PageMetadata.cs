using System.ComponentModel.DataAnnotations;
using System.Reflection;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

// Page metadata: banners, badges, KPIs, FABs, header extras, width/type (Java: PageMetadataExtractor, PageWidthResolver, PageTypeResolver).
public sealed partial class ReflectionMapper
{
    /// <summary>Client-side field validations from the bean-validation constraints (mirrors Java's
    /// ConstraintValidationMapper): [Required] → the field must be truthy ("Cannot be empty");
    /// [Range(min,max)] → two bounds ("Must be at least/at most N"). Emitted in field-declaration
    /// order.</summary>
    private static List<ValidationDto> MapValidations(Type type)
    {
        var validations = new List<ValidationDto>();
        foreach (var p in EditableProperties(type).Where(p => p is { CanRead: true, CanWrite: true }))
        {
            var fieldId = Naming.CamelCase(p.Name);
            if (p.GetCustomAttributes(inherit: true)
                    .Any(a => a is System.ComponentModel.DataAnnotations.RequiredAttribute))
                validations.Add(new ValidationDto($"state['{fieldId}']", fieldId, "Cannot be empty"));
            if (p.GetCustomAttributes(inherit: true)
                    .OfType<System.ComponentModel.DataAnnotations.RangeAttribute>().FirstOrDefault() is { } range)
            {
                validations.Add(new ValidationDto(
                    $"state['{fieldId}'] >= {range.Minimum}", fieldId, $"Must be at least {range.Minimum}"));
                validations.Add(new ValidationDto(
                    $"state['{fieldId}'] <= {range.Maximum}", fieldId, $"Must be at most {range.Maximum}"));
            }
        }
        return validations;
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
            if (p.Find<HiddenAttribute>() is { Value.Length: > 0 } hidden)
                rules.Add(new RuleDto("true", "SetDataValue", fieldId, "hidden", null, hidden.Value, "Continue", null));
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
            .Select(p => (text: p.GetValue(instance)?.ToString(), color: p.Find<HeaderBadgeAttribute>()!.Color))
            .Where(x => !string.IsNullOrWhiteSpace(x.text))
            .Select(x => new BadgeDto(x.text!, x.color))
            .ToList();

    /// <summary>KPI cards for the page header (mirrors Java's PageMetadataExtractor.getKpis): from
    /// [Kpi] methods (the title is the attribute, the value is the call result) AND from [Kpi]
    /// properties (the property value is the text; the property is hoisted out of the form body).</summary>
    private static List<KpiDto> Kpis(Type type, object instance)
    {
        var fromFields = EditableProperties(type)
            .Where(p => p.Find<KpiAttribute>() != null)
            .Select(p => new KpiDto(p.Find<KpiAttribute>()!.Title, p.GetValue(instance)?.ToString() ?? ""));
        var fromMethods = type.GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
            .Where(m => m.Find<KpiAttribute>() != null && m.GetParameters().Length == 0)
            .Select(m => new KpiDto(m.Find<KpiAttribute>()!.Title, m.Invoke(instance, [])?.ToString() ?? ""));
        return fromFields.Concat(fromMethods).ToList();
    }

    /// <summary>Floating action buttons from [Fab] methods (the method name is the action id).</summary>
    private static List<FabDto> Fabs(Type type) =>
        type.GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
            .Where(m => m.Find<FabAttribute>() != null)
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
