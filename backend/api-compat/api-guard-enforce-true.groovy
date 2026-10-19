// Post-analysis script of the public-API compatibility check (japicmp), used when
// mateu.japicmp.enforce=true — the default from 3.0-beta.1 on (backend/pom.xml).
//
// japicmp's own failure ("There is at least one incompatibility: X:METHOD_REMOVED") says WHAT broke
// but not what to do instead, so this script fails first with the list AND the add + deprecate
// recipe. It sees exactly what japicmp would break on: the classes are already filtered by the
// includes/excludes (@Experimental, @Internal, the reviewed allowlist). japicmp's own break stays
// on as a backstop for the cases this walk does not cover.
//
// Bound by japicmp: jApiClasses (List<japicmp.model.JApiClass>); it must return that list.

def problems = []

def report = { String where, def element ->
    if (element == null) return
    def changes = element.compatibilityChanges
            .findAll { !it.binaryCompatible || !it.sourceCompatible }
            .collect { it.type.name() }
            .unique()
    if (changes) problems << "  - ${where}: ${changes.join(', ')}"
}

def params = { def behavior -> behavior.parameters.collect { it.type }.join(',') }

jApiClasses.each { c ->
    def name = c.fullyQualifiedName
    report(name, c)
    report("${name} (superclass)", c.superclass)
    c.interfaces.each { report("${name} (implements ${it.fullyQualifiedName})", it) }
    c.constructors.each { report("${name}(${params(it)})", it) }
    c.methods.each { report("${name}#${it.name}(${params(it)})", it) }
    c.fields.each { report("${name}#${it.name}", it) }
}

if (problems) {
    throw new IllegalStateException("""
Incompatible change to the FROZEN 3.x public API (compared with <mateu.japicmp.baseline> in backend/pom.xml):
${problems.unique().join('\n')}

Within 3.x a stable element is never removed, renamed or re-typed in place. Do ADD + DEPRECATE instead:
  1. add the replacement next to the old element (a new method or overload, a new type, a new
     record component through a new constructor — keep the old constructor delegating to it);
  2. keep the old element WORKING and mark it @Deprecated(since = "<next release>", forRemoval = true)
     with "@deprecated use ... instead" in its Javadoc (DeprecationsNameTheirReplacementTest checks it);
  3. it can be removed in the next minor at the earliest, with a reviewed entry in
     backend/api-compat/japicmp-exclusions.properties naming the release that accepted it.
Not meant to be public API? @Internal (plumbing) or @Experimental (still being shaped) takes it out of
the check — but newly marking API the baseline already has is itself reported as a removal, so it also
needs an exclusions entry until the baseline moves past it.

Policy: doc/src/content/docs/reference/stability-and-versioning.md (https://mateu.io/reference/stability-and-versioning/#enforcement).
Report only, to see the full japicmp report (never for a pull request): -Dmateu.api.enforce=false
""")
}

jApiClasses
