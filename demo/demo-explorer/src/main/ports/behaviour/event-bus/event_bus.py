# The Python twin (mateu-ui): an action returns UICommand.dispatch_event; @subscribe_to runs an
# action of the subscriber with the payload as parameters — source/from_ give the scope.
from typing import Annotated

from mateu_ui.dtos import UICommand
from mateu_ui.uidl import ReadOnly, SubscriptionSource, button, emits, subscribe_to, ui


@ui("madrid-warehouse")
@emits("madrid")
class MadridWarehouse:
    @button()
    def stock_changed(self):
        return UICommand.dispatch_event("stock-changed", {"warehouse": "Madrid"})


# DOCUMENT (default): hears stock-changed from anybody.
@ui("stock-board")
@subscribe_to("stock-changed", "on_stock_changed")
class StockBoard:
    changes_heard: Annotated[int, ReadOnly()] = 0

    def on_stock_changed(self):
        self.changes_heard += 1
        return self


# COMPONENT: only from the emitter named "madrid".
@ui("madrid-listener")
@subscribe_to("stock-changed", "heard", source=SubscriptionSource.COMPONENT, from_="madrid")
class MadridListener:
    times: Annotated[int, ReadOnly()] = 0

    def heard(self):
        self.times += 1
        return self
