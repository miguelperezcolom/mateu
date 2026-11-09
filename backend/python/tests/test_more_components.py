"""The last components that used to be Java-only: each maps to the wire Java's mapper produces
(BoardLayoutMapper … WorkflowMapper) — ids, metadata members and what travels as children."""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from mateu_ui.core.mapper import ReflectionMapper
from mateu_ui.core.mapper.more_components import java_camel_case
from mateu_ui.core.yaml_preview import build_from_yaml
from mateu_ui.uidl import PageResult
from mateu_ui.uidl import components as fl


def wire(c) -> dict:
    return ReflectionMapper().map_component(c).model_dump(by_alias=True)


def t(text):
    return fl.Text(text=text)


def texts(children) -> list:
    return [ch["metadata"]["text"] for ch in children]


def test_board_layout_rows_and_items_travel_as_children():
    w = wire(fl.BoardLayout(id="b", rows=(fl.BoardLayoutRow(content=(
        fl.BoardLayoutItem(content=t("A"), board_cols=2), fl.BoardLayoutItem(board_cols=1))),)))
    assert w["id"] == "b" and w["metadata"] == {"type": "BoardLayout", "rows": []}
    row = w["children"][0]
    assert row["id"] is None and row["metadata"]["type"] == "BoardLayoutRow"
    first, second = row["children"]
    assert first["metadata"]["boardCols"] == 2 and texts(first["children"]) == ["A"]
    assert second["metadata"]["boardCols"] == 1 and second["children"] == []


def test_carousel_layout_flags_ride_the_metadata():
    w = wire(fl.CarouselLayout(id="c", content=(t("1"), t("2")), auto=True, duration=4000, dots=True,
                               loop=True, nav=True, direction=fl.Orientation.vertical))
    m = w["metadata"]
    assert m["type"] == "CarouselLayout" and m["auto"] and m["dots"] and m["loop"] and m["nav"]
    assert m["duration"] == 4000 and m["direction"] == "vertical" and not m["alt"]
    assert w["id"] == "c" and texts(w["children"]) == ["1", "2"]


def test_single_child_wrappers_fill_an_absent_child_with_an_empty_div():
    for cls in (fl.Container, fl.FullWidth, fl.Scroller):
        w = wire(cls(content=t("x"), style="height: 3rem"))
        assert w["metadata"]["type"] == cls.__name__ and w["id"] is None
        assert w["style"] == "height: 3rem" and texts(w["children"]) == ["x"]
        empty = wire(cls())
        assert empty["children"][0]["metadata"] == {"type": "Div", "content": ""}


def test_form_item_and_form_sub_section():
    item = wire(fl.FormItem(id="i", content=(t("a"),)))
    assert item["id"] == "i" and item["metadata"] == {"type": "FormItem"} and texts(item["children"]) == ["a"]
    sub = wire(fl.FormSubSection(title="Address", content=(t("Street"),)))
    assert sub["id"] == "fieldId" and sub["metadata"] == {"type": "FormSubSection", "title": "Address"}
    assert texts(sub["children"]) == ["Street"]


def test_master_detail_layout_master_then_detail_as_children():
    w = wire(fl.MasterDetailLayout(id="md", master=t("M"), detail=t("D")))
    assert w["metadata"] == {"type": "MasterDetailLayout", "orientation": "horizontal"} and texts(w["children"]) == ["M", "D"]
    assert texts(wire(fl.MasterDetailLayout(master=t("M")))["children"]) == ["M"]


def test_context_menu_carries_the_menu_and_the_wrapped_component():
    w = wire(fl.ContextMenu(
        menu=(fl.MenuEntry(label="Open orders"), fl.MenuSeparator(), fl.MenuEntry(label="X", path="/x", disabled=True)),
        wrapped=t("target"), activate_on_left_click=True))
    m = w["metadata"]
    assert w["id"] == "fieldId" and w["children"] == []
    assert m["activateOnLeftClick"] and m["wrapped"]["metadata"]["text"] == "target"
    first, sep, last = m["menu"]
    assert first["path"] == "openOrders" and first["visible"] and first["submenus"] == []
    assert sep["separator"] and sep["path"] == "" and sep["label"] == ""
    assert last["path"] == "/x" and last["disabled"]


def test_directory_nests_submenus():
    w = wire(fl.Directory(menu=(fl.MenuEntry(label="Sales", path="/sales", submenu=(
        fl.MenuEntry(label="Orders", path="/sales/orders"),)),)))
    assert w["metadata"]["type"] == "Directory"
    sales = w["metadata"]["menu"][0]
    assert sales["submenus"][0]["path"] == "/sales/orders"


def test_menu_bar_gets_a_fresh_random_id_like_java():
    c = fl.MenuBar(options=(fl.MenuEntry(label="Home", path="/home"),))
    a, b = wire(c), wire(c)
    uuid.UUID(a["id"])
    assert a["id"] != b["id"]
    assert a["metadata"]["options"][0]["label"] == "Home"


@dataclass
class Booking:
    guest_name: str
    adults: int


def test_grid_columns_groups_and_rows():
    w = wire(fl.Grid(
        id="g",
        content=(
            fl.GridColumn(id="guestName", label="Guest"),
            fl.GridGroupColumn(id="occ", label="Occupancy", columns=(
                fl.GridColumn(id="adults", label="Adults", data_type="integer"),
                fl.GridColumn(id="vip", label="VIP", data_type="bool", width="4rem"),
            )),
        ),
        page=PageResult(content=[Booking("Ada", 2)], total_elements=1),
        row_stripes=True, compact=True,
    ))
    m = w["metadata"]
    assert w["id"] == "g" and w["children"] == [] and m["rowStripes"] and m["compact"]
    assert m["page"] == {"content": [{"guestName": "Ada", "adults": 2}], "totalElements": 1}
    name, group = m["content"]
    assert name["id"] == "guestName"
    nm = name["metadata"]
    assert nm["type"] == "GridColumn" and nm["dataType"] == "string" and nm["stereotype"] == "regular"
    assert nm["autoWidth"] and nm["align"] is None
    gm = group["metadata"]
    assert group["id"] == "occ" and gm["type"] == "GridGroupColumn" and gm["label"] == "Occupancy"
    adults, vip = gm["columns"]
    assert adults["metadata"]["align"] == "end"
    assert vip["metadata"]["align"] == "center" and not vip["metadata"]["autoWidth"]
    assert vip["metadata"]["width"] == "4rem"


def test_grid_without_page_has_no_page():
    assert wire(fl.Grid())["metadata"]["page"] is None


def test_virtual_list_items_travel_without_their_type_discriminator():
    w = wire(fl.VirtualList(page=PageResult(content=[t("r1")], total_elements=7)))
    page = w["metadata"]["page"]
    assert w["id"] == "fieldId" and page["totalElements"] == 7
    assert "type" not in page["content"][0] and page["content"][0]["metadata"]["text"] == "r1"


def test_chat_message_list_and_message_input():
    chat = wire(fl.Chat(sse_url="/sse", upload_url="/up"))
    assert chat["id"] == "fieldId" and chat["metadata"] == {"type": "Chat", "sseUrl": "/sse", "uploadUrl": "/up"}
    ml = wire(fl.MessageList(items=(fl.MessageListItem(text="Hi", user_name="Ada", user_color_index=2),)))
    assert ml["id"] == "messageList"
    assert ml["metadata"]["items"][0] == {
        "text": "Hi", "userName": "Ada", "time": None, "userImg": None, "userAbbr": None, "userColorIndex": 2}
    mi = wire(fl.MessageInput(action_id="send"))
    assert mi["id"] == "messageInput" and mi["metadata"] == {"type": "MessageInput", "actionId": "send"}


def test_not_found_cookie_consent_form_editor_and_workflow():
    nf = wire(fl.NotFound(id="nf", title="Gone", message="m", back_route="/", back_label="Home"))
    assert nf["id"] == "nf" and nf["metadata"]["backRoute"] == "/" and nf["metadata"]["backLabel"] == "Home"
    cc = wire(fl.CookieConsent(message="We use cookies", dismiss="OK",
                               position=fl.CookieConsentPosition.BottomLeft, learn_more_link="https://x"))
    assert cc["id"] == "fieldId" and cc["metadata"]["position"] == "BottomLeft"
    assert cc["metadata"]["learnMoreLink"] == "https://x"
    assert wire(fl.FormEditor(value="{}"))["metadata"] == {"type": "FormEditor", "value": "{}"}
    assert wire(fl.Workflow(value="<bpmn/>"))["metadata"] == {"type": "Workflow", "value": "<bpmn/>"}


def test_message_input_action_is_harvested_for_the_view():
    ids = ReflectionMapper().collect_action_ids(fl.VerticalLayout(content=(fl.MessageInput(action_id="send"),)))
    assert "send" in ids


def test_menu_paths_default_to_javas_camel_case():
    assert java_camel_case("Sales orders") == "salesOrders"
    assert java_camel_case("Orders") == "orders"
    assert java_camel_case("myHTMLPage") == "myHtmlPage"
    assert java_camel_case("") == ""


def test_the_components_are_authorable_in_yaml():
    built = build_from_yaml("""
type: VerticalLayout
content:
  - type: Grid
    id: g
    rowStripes: true
    content:
      - type: GridColumn
        id: name
        label: Name
      - type: GridGroupColumn
        label: Occ
        columns:
          - type: GridColumn
            id: adults
            label: Adults
            dataType: integer
  - type: ContextMenu
    activateOnLeftClick: true
    menu:
      - label: Orders
        path: /orders
    wrapped:
      type: Text
      text: hi
  - type: CookieConsent
    message: cookies
    position: Bottom
  - type: Scroller
    content:
      type: Text
      text: s
""")
    w = ReflectionMapper().map_component(built).model_dump(by_alias=True)
    grid, menu, cookie, scroller = w["children"]
    assert grid["metadata"]["type"] == "Grid" and grid["metadata"]["rowStripes"]
    assert [c["metadata"]["type"] for c in grid["metadata"]["content"]] == ["GridColumn", "GridGroupColumn"]
    assert grid["metadata"]["content"][1]["metadata"]["columns"][0]["metadata"]["align"] == "end"
    assert menu["metadata"]["menu"][0]["path"] == "/orders" and menu["metadata"]["activateOnLeftClick"]
    assert cookie["metadata"]["position"] == "Bottom"
    assert texts(scroller["children"]) == ["s"]
