"""One exit engine for the live EXIT seat, its shadow plans, and the backtest, so what was tested is
exactly what runs.

A plan is a dict:
  sl       stop distance from entry (0.40 = stop at -40%)
  tp       take-profit multiple of entry (2.0 = sell at 2x), or None
  partial  fraction sold at tp (None = sell everything at tp)
  arm      gain that arms the trailing stop (0.12 = +12%), or None
  trail    trailing distance under the peak once armed (0.06 = 6%)
  tmax     time stop in minutes

Bars are (t, open, high, low, close). Live ticks are bars with o = h = l = c. Inside a bar the stop is
checked before the target, and the trailing stop uses the peak from earlier bars only (conservative).
A stop fills at the stop, or at the open when the bar gapped through it.
"""


class ExitState:
    def __init__(self, plan, entry, t0):
        self.p, self.entry, self.t0 = plan, entry, t0
        self.stop = entry * (1 - plan["sl"])
        self.peak = entry
        self.armed = False
        self.left = 1.0
        self.fills = []          # (fraction, price, reason)
        self.done = False

    def _sell(self, frac, px, why):
        frac = min(frac, self.left)
        self.fills.append((frac, px, why))
        self.left = round(self.left - frac, 9)
        if self.left <= 1e-9:
            self.done = True
        return (frac, px, why)

    def bar(self, t, o, h, l, c, first=False):
        """Feed one bar. Returns the fills it caused (possibly empty)."""
        if self.done:
            return []
        p, out = self.p, []
        if l <= self.stop:
            px = min(o, self.stop)
            out.append(self._sell(self.left, px, "trailing stop" if self.armed else "stop"))
            return out
        if p.get("tp") and h >= self.entry * p["tp"] and not any(w == "take profit" for _, _, w in self.fills):
            out.append(self._sell(p.get("partial") or 1.0, self.entry * p["tp"], "take profit"))
            if self.done:
                return out
        if p.get("arm") is not None and h >= self.entry * (1 + p["arm"]):
            self.armed = True
        self.peak = max(self.peak, h)
        if self.armed:
            self.stop = max(self.stop, self.peak * (1 - p["trail"]))
        if (t - self.t0) >= p["tmax"] * 60:
            out.append(self._sell(self.left, c, "time stop"))
        return out

    def gross(self):
        """Gross multiple on what has been sold so far (sum of fraction x price / entry)."""
        return sum(fr * px / self.entry for fr, px, _ in self.fills)


def describe(p):
    parts = [f"stop -{p['sl'] * 100:.0f}%"]
    if p.get("tp"):
        parts.append(f"{'sell ' + str(int(p['partial'] * 100)) + '% at' if p.get('partial') else 'take profit at'} {p['tp']:g}x")
    if p.get("arm") is not None:
        parts.append(f"trail {p['trail'] * 100:.0f}% after +{p['arm'] * 100:.0f}%")
    parts.append(f"out after {p['tmax']} min")
    return ", ".join(parts)
