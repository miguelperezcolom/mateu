namespace Mateu.Core;

/// <summary>The ETA of one running task (<c>ProgressDto.EtaSeconds</c>), estimated from the rate
/// the server OBSERVES — only when it is honest: determinate work, an exponentially smoothed rate
/// (α = 0.3) of the segments that advance, after 2 rate updates and 2 s since the first sample,
/// while 0 &lt; p &lt; 1. Going backwards starts over. The rules and their corpus are
/// <c>conformance/progress/eta.json</c> (mirrors Java's EtaEstimator). Not thread-safe: one per
/// task, fed in stream order. EXPERIMENTAL.</summary>
internal sealed class EtaEstimator
{
    private const double Alpha = 0.3;
    private const int MinRateUpdates = 2;
    private const long MinElapsedMs = 2000;

    private (long T, double P)? _first;
    private (long T, double P)? _prev;
    private double? _ema;
    private int _updates;

    /// <summary>The progress value of a task: the fraction, else done/total, else null (indeterminate).</summary>
    public static double? ValueOf(double? fraction, int? done, int? total) =>
        fraction ?? (total is > 0 ? (done ?? 0) / (double)total.Value : null);

    /// <summary>Feeds one observation at <paramref name="t"/> (ms); answers the estimate in seconds,
    /// or null. A state other than running answers null.</summary>
    public int? Observe(long t, double? p, string state = Mateu.Dtos.ProgressStates.Running)
    {
        if (state != Mateu.Dtos.ProgressStates.Running) return null;
        if (p is null || !double.IsFinite(p.Value)) return null;
        var value = p.Value;
        if (_prev is null || value < _prev.Value.P || t < _prev.Value.T)
        {
            _first = (t, value);
            _prev = (t, value);
            _ema = null;
            _updates = 0;
            return null;
        }
        if (value > _prev.Value.P && t > _prev.Value.T)
        {
            var r = (value - _prev.Value.P) / (t - _prev.Value.T);
            _ema = _ema is null ? r : Alpha * r + (1 - Alpha) * _ema.Value;
            _updates++;
            _prev = (t, value);
        }
        if (_updates < MinRateUpdates || t - _first!.Value.T < MinElapsedMs || _ema is not > 0
            || !(value > 0 && value < 1)) return null;
        // a hair under an exact second is that second (floating point noise must not add one)
        return (int)Math.Ceiling((1 - value) / _ema.Value / 1000 - 1e-6);
    }
}
