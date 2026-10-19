using System.Reflection;
using Mateu.AspNetCore;
using Mateu.Core;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

// The engine of Mateu.Core is internal (3.0-alpha.429): an app authors against Mateu.Uidl, hosts
// with Mateu.AspNetCore and reads the wire with Mateu.Dtos. What Mateu.Core and Mateu.AspNetCore
// still export is pinned here, so the public surface cannot grow (or shrink) without a reviewed
// change to the checked-in lists under api/. To accept a deliberate change, run the suite with
// MATEU_API_WRITE=true and commit the rewritten file.
//
// Mateu.Uidl — the authoring API, frozen from 3.0-beta.1 on (reference/stability-and-versioning.md)
// — is pinned twice: its exported type names, and every public/protected member signature of them.
// A removal or a rename fails here; within 3.x a stable element changes only through add +
// deprecate: add the replacement, keep the old element with [Obsolete("… use … instead")] for at
// least one release, and re-pin (an addition fails too until re-pinned, so it is reviewed).
public class PublicSurfaceTests
{
    [Fact]
    public void Mateu_Core_exports_only_the_pinned_types() =>
        AssertSurface(typeof(DevSpecs).Assembly, "Mateu.Core.public-types.txt");

    [Fact]
    public void Mateu_AspNetCore_exports_only_the_pinned_types() =>
        AssertSurface(typeof(MateuExtensions).Assembly, "Mateu.AspNetCore.public-types.txt");

    [Fact]
    public void Mateu_Uidl_exports_only_the_pinned_types() =>
        AssertSurface(typeof(UIAttribute).Assembly, "Mateu.Uidl.public-types.txt");

    [Fact]
    public void Mateu_Uidl_members_keep_their_pinned_signatures() =>
        AssertMembers(typeof(UIAttribute).Assembly, "Mateu.Uidl.public-members.txt");

    [Fact]
    public void The_engine_is_not_exported()
    {
        // the three types an app used to reach for are reachable only through AddMateu/MapMateu
        foreach (var engine in new[] { typeof(SyncHandler), typeof(MateuRegistry), typeof(ReflectionMapper) })
            Assert.False(engine.IsVisible, engine.FullName + " is public");
    }

    private static void AssertSurface(System.Reflection.Assembly assembly, string file)
    {
        var actual = assembly.GetExportedTypes()
            .Select(t => t.FullName!)
            .Concat(assembly.GetForwardedTypes().Select(t => t.FullName! + " (forwarded)"))
            .OrderBy(n => n, StringComparer.Ordinal)
            .ToList();
        var path = Path.Combine(TestProjectDir(), "api", file);
        if (string.Equals(Environment.GetEnvironmentVariable("MATEU_API_WRITE"), "true",
                StringComparison.OrdinalIgnoreCase))
            File.WriteAllLines(path, actual);
        var expected = File.ReadAllLines(path).Where(l => l.Length > 0).ToList();
        var added = actual.Except(expected).ToList();
        var removed = expected.Except(actual).ToList();
        Assert.True(added.Count == 0 && removed.Count == 0,
            $"The public surface of {assembly.GetName().Name} changed — added: [{string.Join(", ", added)}], "
            + $"removed: [{string.Join(", ", removed)}]. If deliberate, rerun with MATEU_API_WRITE=true "
            + $"and commit api/{file}.");
    }

    // A removed or changed signature is a binary or source break of the frozen 3.x API; an addition is
    // fine within a major but still has to be re-pinned, so every change to the surface is reviewed.
    private static void AssertMembers(Assembly assembly, string file)
    {
        var actual = MemberSignatures(assembly);
        var path = Path.Combine(TestProjectDir(), "api", file);
        if (string.Equals(Environment.GetEnvironmentVariable("MATEU_API_WRITE"), "true",
                StringComparison.OrdinalIgnoreCase))
            File.WriteAllLines(path, actual);
        var expected = File.ReadAllLines(path).Where(l => l.Length > 0).ToList();
        var removed = expected.Except(actual).ToList();
        var added = actual.Except(expected).ToList();
        Assert.True(removed.Count == 0 && added.Count == 0,
            $"The public members of {assembly.GetName().Name} changed.\n"
            + (removed.Count == 0 ? "" : $"REMOVED or CHANGED (breaks the 3.x API promise):\n  {string.Join("\n  ", removed)}\n")
            + (added.Count == 0 ? "" : $"ADDED:\n  {string.Join("\n  ", added)}\n")
            + "Within 3.x never remove or change a stable member in place: add the new one and keep the old "
            + "with [Obsolete(\"… use … instead\")] (reference/stability-and-versioning.md). "
            + $"Then rerun with MATEU_API_WRITE=true and commit api/{file}.");
    }

    internal static List<string> MemberSignatures(Assembly assembly)
    {
        const BindingFlags flags = BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance
                                   | BindingFlags.Static | BindingFlags.DeclaredOnly;
        var lines = new List<string>();
        foreach (var type in assembly.GetExportedTypes())
        {
            var owner = TypeName(type);
            bool Visible(MethodBase? m) => m != null && (m.IsPublic || ((m.IsFamily || m.IsFamilyOrAssembly) && !type.IsSealed));
            if (type.IsEnum)
            {
                foreach (var name in Enum.GetNames(type)) lines.Add($"{owner} enum {name}");
                continue;
            }
            foreach (var c in type.GetConstructors(flags).Where(Visible))
                lines.Add($"{owner} ctor({Parameters(c)})");
            foreach (var m in type.GetMethods(flags).Where(Visible))
            {
                if (m.IsSpecialName && !m.Name.StartsWith("op_", StringComparison.Ordinal)) continue; // accessors
                // compiler-generated: the record boilerplate (Equals, ToString, PrintMembers, <Clone>$…)
                if (m.Name.StartsWith('<') || m.IsDefined(typeof(System.Runtime.CompilerServices.CompilerGeneratedAttribute), false)) continue;
                var generic = m.IsGenericMethodDefinition
                    ? "<" + string.Join(",", m.GetGenericArguments().Select(a => a.Name)) + ">" : "";
                lines.Add($"{owner} {(m.IsStatic ? "static " : "")}{(m.IsAbstract ? "abstract " : m.IsVirtual && !m.IsFinal ? "virtual " : "")}"
                          + $"method {TypeName(m.ReturnType)} {m.Name}{generic}({Parameters(m)})");
            }
            foreach (var p in type.GetProperties(flags))
            {
                if (p.Name == "EqualityContract") continue; // record boilerplate
                var get = p.GetMethod is { } g && Visible(g) ? "get;" : "";
                var set = p.SetMethod is { } s2 && Visible(s2)
                    ? (s2.ReturnParameter.GetRequiredCustomModifiers().Any(t => t.Name == "IsExternalInit") ? "init;" : "set;")
                    : "";
                if (get.Length + set.Length == 0) continue;
                var index = p.GetIndexParameters();
                var name = index.Length == 0 ? p.Name : $"this[{string.Join(",", index.Select(i => TypeName(i.ParameterType)))}]";
                lines.Add($"{owner} {((p.GetMethod ?? p.SetMethod)!.IsStatic ? "static " : "")}property {TypeName(p.PropertyType)} {name} {{ {get}{set} }}");
            }
            foreach (var f in type.GetFields(flags).Where(f => f.IsPublic || ((f.IsFamily || f.IsFamilyOrAssembly) && !type.IsSealed)))
                lines.Add($"{owner} {(f.IsLiteral ? "const " : f.IsStatic ? "static " : "")}{(f.IsInitOnly ? "readonly " : "")}field {TypeName(f.FieldType)} {f.Name}");
            foreach (var e in type.GetEvents(flags).Where(e => Visible(e.AddMethod)))
                lines.Add($"{owner} event {TypeName(e.EventHandlerType!)} {e.Name}");
        }
        return lines.Distinct().OrderBy(l => l, StringComparer.Ordinal).ToList();
    }

    private static string Parameters(MethodBase m) => string.Join(", ", m.GetParameters().Select(p =>
        (p.IsOut ? "out " : p.ParameterType.IsByRef ? "ref " : "") + TypeName(p.ParameterType)
        + (p.HasDefaultValue ? " = " + (p.DefaultValue is string str ? "\"" + str + "\"" : p.DefaultValue?.ToString() ?? "null") : "")));

    private static string TypeName(Type t)
    {
        if (t.IsByRef) return TypeName(t.GetElementType()!);
        if (t.IsArray) return TypeName(t.GetElementType()!) + "[" + new string(',', t.GetArrayRank() - 1) + "]";
        if (t.IsGenericParameter) return t.Name;
        if (Nullable.GetUnderlyingType(t) is { } u) return TypeName(u) + "?";
        var name = (t.IsNested ? TypeName(t.DeclaringType!) + "+" : t.Namespace + ".") + t.Name;
        if (t.IsGenericType)
        {
            var args = t.GetGenericArguments();
            var own = t.IsNested ? args.Skip(t.DeclaringType!.GetGenericArguments().Length).ToArray() : args;
            var tick = name.IndexOf('`');
            if (tick >= 0) name = name[..tick];
            if (own.Length > 0) name += "<" + string.Join(",", own.Select(TypeName)) + ">";
        }
        return name;
    }

    // not [CallerFilePath]: CI builds deterministically, so source paths come out as "/_/..."
    private static string TestProjectDir()
    {
        for (var d = new DirectoryInfo(AppContext.BaseDirectory); d != null; d = d.Parent)
            if (File.Exists(Path.Combine(d.FullName, "Mateu.Tests.csproj"))) return d.FullName;
        throw new InvalidOperationException("Mateu.Tests.csproj not found above " + AppContext.BaseDirectory);
    }
}
