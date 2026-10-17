using System.Globalization;
using System.Numerics;

namespace Mateu.Core;

/// <summary>The wire shape of the scalar types the web wire has no native JSON for (Java's
/// LegacyDateTimes + its BigInteger handling): a date-time is a LOCAL ISO date-time
/// (<c>2026-10-17T10:15:30</c>, what the date-time pickers read and write — a DateTimeOffset in the
/// server's zone), a time is <c>HH:mm[:ss]</c> and a BigInteger travels as its digits (a JSON number
/// that large loses precision in the browser, and System.Text.Json cannot write one).</summary>
internal static class TemporalWire
{
    public static object? Format(object? value) => value switch
    {
        DateTime dt => dt.ToString("yyyy-MM-ddTHH:mm:ss", CultureInfo.InvariantCulture),
        DateTimeOffset dto => dto.ToLocalTime().ToString("yyyy-MM-ddTHH:mm:ss", CultureInfo.InvariantCulture),
        TimeOnly t => t.ToString(t.Second == 0 ? "HH:mm" : "HH:mm:ss", CultureInfo.InvariantCulture),
        BigInteger b => b.ToString(CultureInfo.InvariantCulture),
        _ => value,
    };

    public static object Parse(string raw, Type target)
    {
        raw = raw.Trim();
        if (target == typeof(BigInteger))
            return BigInteger.Parse(raw.Split('.')[0], CultureInfo.InvariantCulture);
        if (target == typeof(TimeOnly))
            return TimeOnly.Parse(raw, CultureInfo.InvariantCulture);
        if (target == typeof(DateTimeOffset))
            // a local date-time is in the server's zone; one carrying an offset keeps it
            return DateTimeOffset.Parse(raw, CultureInfo.InvariantCulture, DateTimeStyles.AssumeLocal);
        return DateTime.Parse(raw, CultureInfo.InvariantCulture);
    }
}
