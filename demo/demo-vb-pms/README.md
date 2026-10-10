# demo-vb-pms — an OPERA Cloud-like PMS on Mateu

A property management system that copies the screens of Oracle OPERA Cloud. It has fictitious data
in memory and no real business logic. It is written once, in Java, and it runs on both the
**Redwood** renderer (Oracle Visual Builder, `io.mateu:redwood`) and the **Vaadin** renderer. Its job
is to show what Mateu can draw in Redwood for a real back-office product. It is the reference app
for the Redwood PMS parity work (branch `feat/redwood-pms-parity`).

Nothing hotel-specific is in the framework. Everything OPERA-flavoured lives in this module.

## Run it

```bash
# backend (Spring MVC) on :9005
cd demo/demo-vb-pms && mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=9005

# the Redwood renderer served by vb-serve on :9006, talking to :9005
cd frontend/web/monorepo/apps/redwood && npm install && npm run serve

# or the same app on the Vaadin renderer
cd demo/demo-vb-pms && mvn spring-boot:run -Dmateu.renderer=vaadin-lit -Dspring-boot.run.arguments=--server.port=9011
```

With the `io.mateu:redwood` jar on the classpath (`npm run copy` + `mvn install` of
`backend/shared/frontend/redwood`), the backend serves the Redwood app itself on its own port.

## Screens

The citations point to the *OPERA Cloud 26.3 user guide*. The number is the guide chapter
(001 Getting started, 002 Devices, 003 Bookings, 004 Front Desk, 005 Inventory, 006 Financials).
The captures are in `frontend/web/monorepo/apps/redwood/poc/shots/`.

| Section › screen | Route | What it imitates | Capture |
|---|---|---|---|
| Shell | `/` | Application navigation: the sections in the hamburger and the screens of the section in the band under the header; notification bell; undoable toasts (001 "Application Navigation") | `pms-notifications.png`, `pms-undo-toast.png` |
| Home › Dashboard | `/home/dashboard` | Manager dashboard: KPI tiles that drill into the filtered search, charts, tiles the user drags into their own order (001 "Dashboards") | `pms-dashboard.png`, `pms-dashboard-drill.png`, `pms-dashboard-reordered.png` |
| Home › Calendar | `/home/calendar` | Property Calendar: Day, Week, Month and List views, the maximum availability on each date, a date opens availability (003 "Using the Property Calendar") | `pms-calendar-month.png`, `pms-calendar-week.png`, `pms-calendar-list.png` |
| Bookings › Reservations | `/bookings/reservations` | Reservation search: rows toned by status, column chooser, saved views, CSV/Excel export, rate breakdown on hover (001 "Using Advanced Search", "Modifying Column Selection and Sequence") | `pms-reservations-columns.png`, `pms-rate-cell-tooltip.png` |
| Bookings › Room diary | `/bookings/roomDiary` | Room Diary: rooms × 1–28 days, bars in their colour, hover summary, drag to move or resize, select empty cells to book (003 "About the Room Diary", "Using Click, Drag and Drop") | `pms-room-diary.png`, `pms-room-diary-range.png`, `pms-room-diary-new-stay.png` |
| Bookings › Property availability | `/bookings/propertyAvailability` | Property Availability: metrics × dates in collapsible sections, cells that link, the overbooking row edited in place (003 "Property Availability") | `pms-property-availability.png`, `pms-property-availability-edited.png` |
| Bookings › New reservation | `/bookings/newReservation` | Look to Book: arrival, nights and departure linked; fields shown and enabled from others (003 "Using Look to Book Sales Screen") | `pms-new-reservation-rules.png` |
| Bookings › Sales map | `/bookings/salesMap` | The map view of the Look to Book Sales Screen: the chain's properties on a street map, coloured by tonight's availability; a property opens its summary (003 "Using Look to Book Sales Screen") | `pms-sales-map.png`, `pms-sales-map-property.png` |
| Bookings › Reservation | `/bookings/reservation` | Presentation page: header that sticks on scroll, collapsible panels, tabs (nested in the changes log), folio windows as a foldout, rate popover, formatted traces and notes, the *I Want To…* overlay on Ctrl+I (001 "Presentation Pages", "I Want to Menu"; 003 "Managing Reservation Alerts") | `pms-reservation-panels.png`, `pms-reservation-sticky.png`, `pms-nested-tabs.png`, `pms-rate-popover.png`, `pms-reservation-notes.png`, `pms-i-want-to.png` |
| Bookings › Quick access | — | A menu group shown as cards | — |
| Front desk › Check-in | `/frontDesk/checkIn` | Registration card: identification, deposit, signature on the tablet, ID scanned with the camera (004 "Checking in Reservations"; 002 "Using the Desktop ID Document Scanner") | `pms-registration-card.png` |
| Front desk › Telephone operator | `/frontDesk/telephoneOperator` | Telephone operator in the Console view: in-house guests on the left, details on the right (004 "Telephone Operator"; 001 "Console") | `pms-telephone-console.png` |
| Inventory › Housekeeping board | `/inventory/housekeepingBoard` | Housekeeping Board: rooms by status, multi-select and *Set room status*, background refresh (005 "Using the Housekeeping Board") | `pms-housekeeping-board.png`, `pms-housekeeping-set-status.png`, `pms-housekeeping-applied.png` |
| Inventory › Floor plan | `/inventory/floorPlan` | Floor plan: the floor with rooms coloured by status, a click opens the room, refresh every 10 s. Built as an `Element` (a third-party web component), which is the documented escape hatch (005 "Housekeeping") | `pms-floor-plan.png`, `pms-floor-plan-polling.png` |
| Inventory › Room types | `/inventory/roomTypes` | Room types with their photo gallery, and the housekeeping team on duty (005 "Room Types") | `pms-room-types.png` |
| Financials › Billing | `/financials/billing` | Billing: the folio generated as a PDF and downloaded (006 "About Billing", "Generating a Folio") | `pms-billing-download.png` |
| Financials › Folio | `/financials/folio` | The folio summarized: charges grouped by transaction code, with subtotals and total (006 "About Billing") | `pms-folio-summarized.png` |
| Financials › Windows | `/financials/windows` | Folio windows: select charges and drag them onto another window (006 "Billing", "Transfer Charges using Drag and Drop") | `pms-folio-windows.png`, `pms-folio-windows-moved.png` |
| Financials › End of day | `/financials/endOfDay` | End of Day: a guided run that stops at arrivals not checked in, departures not checked out and open cashiers; the procedures run with their progress streamed live (a `LongTask` returned from the completion action); then the status of each procedure and the new business date (006 "Running End of Day") | `pms-end-of-day-arrivals.png`, `pms-end-of-day-stop.png`, `pms-end-of-day-progress.png`, `pms-end-of-day-done.png` |

The access keys (Alt+letter on the section band) show on every screen: `pms-access-keys.png`.

## What is not here

- **Page Composer** and real devices (payment terminal, key encoder, physical scanner) are out of
  scope. The screens around them (signature, camera) are here.

The Sales map draws with Leaflet on Redwood, since JET has no street map component, and with
OpenLayers on Vaadin, both over OpenStreetMap tiles. Those tile servers are not meant for heavy
production traffic.
