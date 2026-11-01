#!/usr/bin/env python3
"""
Writes the DATA of the demo's visual pages from space-service: the dashboard's KPIs and charts, the
budget charts, the task board, the launch calendar, the launch-site map, the mission Gantt and
timeline, and the crew multi-select's options.

Why a snapshot: in a YAML page a Chart, a Kanban, a Calendar, a Map, a Gantt and a Timeline carry
their data inline — none of them reads a REST source (only listings, option fields and the shell's
search/inbox do). So the data is copied from the API into the pages here, and the pages say so.
Everything else in the demo reads the API live.

Each page keeps its hand-written YAML; this script only rewrites the regions between

    # >>> generated: <name>
    # <<< generated: <name>

markers (indented like the marker), plus the partial partials/crew-field.yaml, which it writes whole.

    python3 scripts/snapshot.py                        # against http://localhost:8122
    SPACE_API=https://space.mateu.io python3 scripts/snapshot.py

Standard library only.
"""

import json
import os
import re
import urllib.request
from pathlib import Path

API = os.environ.get("SPACE_API", "http://localhost:8122").rstrip("/")
UI = Path(__file__).resolve().parent.parent / "src" / "main" / "resources" / "specs" / "ui"


def get(path):
    with urllib.request.urlopen(API + path, timeout=30) as r:
        return json.loads(r.read().decode("utf-8"))


def rows(path):
    return get(path + ("&" if "?" in path else "?") + "size=200")["content"]


def y(value):
    """One value as YAML: JSON is YAML, and a flow mapping per item keeps the regions readable."""
    return json.dumps(value, ensure_ascii=False)


def region(file, name, lines):
    path = UI / file
    text = path.read_text()
    pattern = re.compile(
        r"^(?P<indent>[ ]*)# >>> generated: " + re.escape(name) + r"[^\n]*\n.*?^[ ]*# <<< generated: " + re.escape(name) + r"[^\n]*\n",
        re.S | re.M)
    m = pattern.search(text)
    if not m:
        raise SystemExit(f"{file}: no '# >>> generated: {name}' region")
    indent = m.group("indent")
    body = "".join(indent + line + "\n" for line in lines)
    replacement = (f"{indent}# >>> generated: {name} (scripts/snapshot.py — do not edit by hand)\n"
                   f"{body}{indent}# <<< generated: {name}\n")
    path.write_text(text[:m.start()] + replacement + text[m.end():])


def human(code):
    return (code or "").replace("_", " ").capitalize()


def money_b(usd):
    return f"${usd / 1e9:,.1f} bn"


def chart_panel(title, subtitle, chart_type, series, label, col_span=None, style=None):
    panel = {"type": "DashboardPanel", "title": title, "subtitle": subtitle,
             "content": {"type": "Chart", "chartType": chart_type,
                         "chartData": {"labels": [human(p["label"]) if p["label"].isupper() else p["label"] for p in series],
                                       "datasets": [{"label": label, "data": [float(p["value"]) for p in series]}]}}}
    if col_span:
        panel["colSpan"] = col_span
    if style:
        panel["style"] = style
    return panel


def zone(percent):
    """A column of a wrapping row (the @Zones convention): side by side on a wide screen, one under the
    other on a phone (the row wraps under 20rem; Redwood stacks the columns below md)."""
    return f"flex: 1 1 calc({percent}% - var(--lumo-space-m, 1rem)); min-width: min(20rem, 100%);"


def main():
    stats = get("/api/stats")
    missions = rows("/api/missions?sort=launchDate")
    launches = rows("/api/launches?sort=launchDate")
    sites = rows("/api/launch-sites?sort=name")
    tasks = rows("/api/tasks?sort=dueDate")
    astronauts = rows("/api/astronauts?sort=name")

    # ── the dashboard: KPI band + charts ─────────────────────────────────────────────────────────
    kpis = [
        {"type": "MetricCard", "title": "Missions", "value": str(stats["missions"]),
         "description": f"{stats['activeMissions']} active, {stats['crewedMissions']} crewed", "actionId": "go-missions"},
        {"type": "MetricCard", "title": "Astronauts", "value": str(stats["astronauts"]), "description": "who flew them", "actionId": "go-astronauts"},
        {"type": "MetricCard", "title": "Launches", "value": str(stats["launches"]),
         "description": f"{stats['launchSuccessRate']}% successful", "trend": "up", "actionId": "go-launches"},
        {"type": "MetricCard", "title": "Mission cost", "value": money_b(float(stats["missionCostUsd"])),
         "description": "where the cost is known", "timeframe": "1961–2026"},
    ]
    region("dashboard.yaml", "kpis", [f"- {y(k)}" for k in kpis])
    charts = [
        chart_panel("Launches per decade", "Every launch in the dataset", "bar", stats["launchesByDecade"], "Launches", 2),
        chart_panel("Missions by status", "Planned, active, completed or lost", "doughnut", stats["missionsByStatus"], "Missions"),
        chart_panel("Missions by type", "What kind of mission each one is", "bar", stats["missionsByType"], "Missions"),
        chart_panel("Where they went", "Missions by destination", "pie", stats["missionsByDestination"], "Missions"),
        chart_panel("NASA budget", "Millions of USD per fiscal year (totals from Wikidata, interpolated)", "line",
                    stats["budgetByYear"], "Budget (M USD)"),
        chart_panel("Work left", "Mission tasks by status (synthetic)", "bar", stats["tasksByStatus"], "Tasks"),
    ]
    region("dashboard.yaml", "charts", [f"- {y(c)}" for c in charts])

    # ── budget page ──────────────────────────────────────────────────────────────────────────────
    budget_charts = [
        chart_panel("Budget per year", "Millions of USD (totals: Wikidata, interpolated)", "bar", stats["budgetByYear"], "Budget (M USD)",
                    style=zone(64)),
        chart_panel(f"By program, FY{stats['budgetYear']}", "Millions of USD (synthetic split)", "doughnut",
                    stats["budgetByProgram"], "Budget (M USD)", style=zone(36)),
    ]
    region("budget.yaml", "charts", [f"- {y(c)}" for c in budget_charts])

    # ── the task board ───────────────────────────────────────────────────────────────────────────
    colours = {"BACKLOG": "#8a8f98", "IN_PROGRESS": "#1676f3", "TESTING": "#e8a33d", "DONE": "#2e9e5b"}
    priority = {"CRITICAL": "error", "HIGH": "warning", "MEDIUM": "contrast", "LOW": "success"}
    columns = []
    for status in ("BACKLOG", "IN_PROGRESS", "TESTING", "DONE"):
        cards = [{"id": f"task-{t['id']}", "title": t["title"],
                  "description": f"{t['missionName']} · {t['owner']} · due {t['dueDate']}",
                  "badge": human(t["priority"]), "color": priority.get(t["priority"]),
                  "actionId": f"open-task-{t['id']}"} for t in tasks if t["status"] == status]
        columns.append({"id": status, "title": f"{human(status)} ({len(cards)})", "color": colours[status], "cards": cards})
    region("board.yaml", "board", ["- type: Kanban", "  columns:"] + [f"    - {y(c)}" for c in columns])
    region("board.yaml", "actions", [f"- {y({'id': f'open-task-{t['id']}', 'steps': [{'type': 'Navigate', 'route': f'tasks/{t['id']}'}]})}" for t in tasks])

    # ── the launch calendar ──────────────────────────────────────────────────────────────────────
    outcome = {"SUCCESS": "#2e9e5b", "FAILURE": "#d93025", "PARTIAL_FAILURE": "#e8a33d", "SCHEDULED": "#1676f3"}
    events = [{"id": f"launch-{l['id']}", "title": f"{l['missionName']} · {l['vehicle'] or 'launch'}", "date": l["launchDate"],
               **({"startTime": l["launchTimeUtc"][:5]} if l["launchTimeUtc"] else {}),
               "color": outcome.get(l["outcome"]), "actionId": f"open-mission-{l['missionId']}"} for l in launches]
    months = [("July 1969 · Apollo 11", "1969-07-01"), ("Summer 1977 · the Voyagers", "1977-08-01"),
              ("January 1986 · Challenger", "1986-01-01"), ("July 2020 · Mars 2020", "2020-07-01"),
              ("April 2026 · Artemis II", "2026-04-01")]
    days = [{"date": "1969-07-20", "label": "Moon landing", "tone": "success"},
            {"date": "1986-01-28", "label": "Challenger", "tone": "error"},
            {"date": "2021-02-18", "label": "Perseverance lands", "tone": "success"}]
    calendars = ["- type: TabLayout", "  tabs:"]
    for label, month in months:
        calendars += [f"    - type: Tab", f"      label: {y(label)}", "      content:", "        type: Calendar",
                      f"        month: {y(month)}", "        view: month", "        views: [month, week, day, list]",
                      f"        days: {y(days)}", "        events:"] + [f"          - {y(e)}" for e in events]
    region("calendar.yaml", "calendars", calendars)
    mission_ids = sorted({l["missionId"] for l in launches})
    region("calendar.yaml", "actions", [f"- {y({'id': f'open-mission-{m}', 'steps': [{'type': 'Navigate', 'route': f'missions/{m}'}]})}" for m in mission_ids])

    # ── the launch-site map ──────────────────────────────────────────────────────────────────────
    markers = [{"id": str(s["id"]), "latitude": float(s["latitude"]), "longitude": float(s["longitude"]),
                "label": s["name"], "description": f"{s['launchCount']} launch(es) in the dataset · {s['country']}",
                "color": "#2e9e5b" if s["active"] else "#8a8f98"}
               for s in sites if s["latitude"] is not None and s["longitude"] is not None]
    region("sites-map.yaml", "markers", ["markers:"] + [f"  - {y(m)}" for m in markers])

    # ── the mission timeline: a Gantt of durations and a Timeline of milestones ──────────────────
    tasks_g = []
    for m in missions:
        if not m["launchDate"]:
            continue
        end = m["endDate"] or ("2026-10-31" if m["status"] == "ACTIVE" else m["launchDate"])
        if end == m["launchDate"]:
            continue  # a one-day flight has no bar worth drawing
        tasks_g.append({"id": f"m{m['id']}", "title": m["name"], "start": m["launchDate"], "end": end,
                        "progress": 100 if m["status"] in ("COMPLETED", "FAILED", "PARTIAL_SUCCESS") else 60,
                        "color": "#2e9e5b" if m["status"] == "ACTIVE" else ("#d93025" if m["status"] == "FAILED" else "#1676f3")})
    region("timeline.yaml", "gantt", ["tasks:"] + [f"  - {y(t)}" for t in tasks_g])
    milestones = [m for m in missions if m["featured"] or m["status"] == "FAILED"]
    items = [{"id": f"t{m['id']}", "title": m["name"], "description": m["summary"] or m["program"],
              "timestamp": m["launchDate"] or "planned", "color": "#d93025" if m["status"] == "FAILED" else "#1676f3",
              "actionId": f"open-mission-{m['id']}"} for m in milestones]
    region("timeline.yaml", "items", ["items:"] + [f"  - {y(i)}" for i in items])
    region("timeline.yaml", "actions", [f"- {y({'id': f'open-mission-{m['id']}', 'steps': [{'type': 'Navigate', 'route': f'missions/{m['id']}'}]})}" for m in milestones])

    # ── the crew multi-select (a to-many reference): its options, inline ────────────────────────
    field = {"type": "FormField", "id": "crewIds", "label": "Crew", "dataType": "array", "stereotype": "combobox",
             "options": [{"value": a["id"], "label": a["name"]} for a in astronauts]}
    (UI / "partials" / "crew-field.yaml").write_text(
        "# The crew of a mission: a MULTI-SELECT over the astronauts — a to-many reference written as a\n"
        "# list of ids. Generated by scripts/snapshot.py: a multi-select reads its options inline, not\n"
        "# from a REST source (see the README), so the astronauts are copied here. Do not edit by hand.\n"
        + "\n".join(f"{k}: {y(v)}" for k, v in field.items()) + "\n")

    region("plan.yaml", "crew-field", [f"- {y(field)}"])

    print(f"snapshot from {API}: {len(kpis)} KPIs, {len(charts) + len(budget_charts)} charts, {len(tasks)} cards, "
          f"{len(events)} launches, {len(markers)} sites, {len(tasks_g)} Gantt bars, {len(items)} milestones, "
          f"{len(astronauts)} crew options")


if __name__ == "__main__":
    main()
