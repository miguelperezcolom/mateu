# Wire conformance corpus

The wire is the contract: any server can serve any renderer. Three servers emit it — Java (the
reference), .NET and Python — and until now each proved that with **its own** assertions, written
next to its own code.

That verifies "the port does what the port does", not "the port meets the spec". The practical
difference is who carries the work: with per-port assertions, a new feature has to be walked into
three codebases by whoever knows all three. With a shared corpus, a port can fail **on its own**, in
its own CI, and its owner sees it without anyone else intervening.

This directory is that corpus.

## Shape

```
conformance/
  cases/
    <case>/
      case.md         what the case pins, and why it is worth pinning
      expected.json   the normalised wire the three servers must produce
```

## The contract

Each case names a **fixture** that every server implements with the same semantics — same route,
same fields, same declarations. Rendering it must produce the same normalised wire.

`expected.json` is generated from the Java reference and then **frozen**: from that point it is the
spec, and a change to it is a change to the contract, reviewed as such. Regenerating it because a
port disagrees is exactly the move this corpus exists to prevent.

## Normalisation

Raw wire carries values that legitimately differ between servers and between runs — generated
component ids, ordering of map-like structures, absent-vs-null. Comparing those would make the
corpus flag noise, and a check that reports noise gets ignored.

So both sides normalise before comparing:

- **drop** generated identifiers (`id` values the server invents) and empty/null members;
- **sort** object keys;
- keep everything that describes *what the screen is*: types, field ids, labels, data types,
  actions, layout structure.

The normaliser is small on purpose and lives with each runner, so a port needs no Java to run the
corpus.

## Running it

| Server | Command |
|---|---|
| Java | `cd backend/shared/core && mvn test -Dtest=WireConformanceTest` |
| Python | `cd backend/python && python -m pytest tests/test_wire_conformance.py` |
| .NET | `cd backend/dotnet && dotnet test --filter WireConformance` |

Regenerating the goldens (Java only, and a reviewed act):

```bash
cd backend/shared/core && mvn test -Dtest=WireConformanceTest -Dconformance.write=true
```

## Adding a case

1. Add the fixture to all three servers, with the same semantics.
2. Add `cases/<name>/case.md` saying what it pins.
3. Generate `expected.json` from Java.
4. Run the other two. If they differ, that is the corpus doing its job: either the port has a gap,
   or the case is not expressible there and `case.md` should say so.
