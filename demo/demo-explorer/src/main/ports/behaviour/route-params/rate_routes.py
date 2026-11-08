# The Python twin (mateu-ui): a RouteEntrySupplier with the same RouteEntry model (path params,
# fixed and default params). Same precedence: fixed > client state > path > query > defaults.
from mateu_ui.core.route_registry import RouteEntry, RouteEntrySupplier


class RateRoutes(RouteEntrySupplier):
    def routes(self) -> list[RouteEntry]:
        return [
            RouteEntry(
                route="rates/web/:hotel",
                view_model="views.RateQuote",
                fixed_params={"channel": "web"},
                default_params={"currency": "EUR", "nights": 1},
            ),
            RouteEntry(
                route="rates/agents/:hotel",
                view_model="views.RateQuote",
                fixed_params={"channel": "travel agents"},
                default_params={"currency": "EUR", "nights": 1},
            ),
        ]
