"""The MCP tools an agent drives: routes from the menu, run/search dispatch, and the projection's
edge rules (dedupe, button-only actions, title fallbacks). Pure stdlib, like test_mcp.py."""

import importlib.util
import json
import unittest
from pathlib import Path

_mcp_path = Path(__file__).resolve().parents[1] / "mateu_ui" / "core" / "mcp.py"
_spec = importlib.util.spec_from_file_location("mateu_mcp_tools_under_test", _mcp_path)
mcp = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(mcp)


def _app_increment():
    return {"fragments": [{"component": {"type": "ServerSide", "route": "_empty", "children": [
        {"type": "ClientSide", "metadata": {"type": "App", "menu": [
            {"caption": "Products", "route": "/products"},
            {"label": "Admin", "submenus": [
                {"caption": "Users", "path": "admin/users"},
                {"caption": "Users again", "route": "admin/users"},
                "not-a-dict",
            ]},
            {"caption": "Nested", "menu": [{"label": "Deep", "route": "deep"}]},
            {"caption": "No route"},
        ]}},
        {"type": "ClientSide", "route": "/orders", "label": "Orders"},
    ]}}]}


class ListRoutesTest(unittest.TestCase):
    def test_routes_come_from_the_menu_tree_and_route_nodes(self):
        routes = {r["route"]: r["caption"] for r in mcp.list_routes_from(_app_increment())}
        self.assertEqual(routes["products"], "Products")
        self.assertEqual(routes["admin/users"], "Users")  # first caption wins
        self.assertEqual(routes["deep"], "Deep")
        self.assertEqual(routes["orders"], "Orders")
        self.assertEqual(routes[""], "Home")  # the home is always listed

    def test_no_increment_still_lists_home(self):
        self.assertEqual(mcp.list_routes_from(None), [{"route": "", "caption": "Home"}])

    def test_a_menu_that_is_not_a_list_is_ignored(self):
        inc = {"fragments": [{"component": {"metadata": {"type": "App", "menu": "oops"}}}]}
        self.assertEqual(mcp.list_routes_from(inc), [{"route": "", "caption": "Home"}])


class DispatchTest(unittest.TestCase):
    def setUp(self):
        self.calls = []

    def sync(self, route, action_id, state, params):
        self.calls.append((route, action_id, state, params))
        return _app_increment() if route == "" and not action_id else {"fragments": []}

    def test_list_routes_loads_the_home(self):
        out = mcp.dispatch_tool("mateu_list_routes", {}, self.sync)
        self.assertEqual(self.calls, [("", "", None, None)])
        self.assertIn({"route": "products", "caption": "Products"}, out)

    def test_run_action_sends_the_state_to_the_normalised_route(self):
        mcp.dispatch_tool("mateu_run_action", {"route": "/editor", "actionId": "save", "componentState": {"a": 1}}, self.sync)
        self.assertEqual(self.calls, [("editor", "save", {"a": 1}, None)])

    def test_search_sends_text_as_parameter_and_filters_as_state(self):
        mcp.dispatch_tool("mateu_search", {"route": "books", "searchText": "quij", "filters": {"classic": True}}, self.sync)
        mcp.dispatch_tool("mateu_search", {"route": "books"}, self.sync)
        self.assertEqual(self.calls, [
            ("books", "search", {"classic": True, "searchText": "quij"}, {"searchText": "quij"}),
            ("books", "search", None, {}),
        ])

    def test_unknown_tool_is_refused(self):
        with self.assertRaises(ValueError):
            mcp.dispatch_tool("rm_rf", {}, self.sync)

    def test_unknown_tool_over_jsonrpc_is_an_error_result_not_a_crash(self):
        r = mcp.handle_jsonrpc({"id": 5, "method": "tools/call", "params": {"name": "rm_rf"}}, self.sync)
        self.assertTrue(r["result"]["isError"])
        self.assertIn("Unknown tool", r["result"]["content"][0]["text"])

    def test_list_routes_over_jsonrpc(self):
        r = mcp.handle_jsonrpc({"id": 6, "method": "tools/call", "params": {"name": "mateu_list_routes"}}, self.sync)
        self.assertIn("products", [x["route"] for x in json.loads(r["result"]["content"][0]["text"])])


class JsonRpcEdgesTest(unittest.TestCase):
    def test_ping_answers_empty(self):
        self.assertEqual(mcp.handle_jsonrpc({"id": 1, "method": "ping"}, None)["result"], {})

    def test_unknown_notification_is_silent(self):
        self.assertIsNone(mcp.handle_jsonrpc({"method": "whatever"}, None))

    def test_failing_notification_is_silent(self):
        def boom(*_):
            raise RuntimeError("boom")
        self.assertIsNone(mcp.handle_jsonrpc({"method": "tools/call", "params": {"name": "mateu_list_routes"}}, boom))

    def test_initialize_notification_without_id_yields_nothing(self):
        self.assertIsNone(mcp.handle_jsonrpc({"method": "initialize"}, None))


class ProjectionEdgesTest(unittest.TestCase):
    def test_duplicate_fields_and_actions_are_listed_once_and_buttons_add_actions(self):
        inc = {"fragments": [{"component": {
            "type": "ServerSide", "route": "x",
            "initialData": {"name": "Ada"},
            "actions": [{"id": "save"}, {"id": "save"}, {"id": ""}, {"id": "docs", "href": "https://x"}],
            "children": [
                {"metadata": {"type": "FormField", "fieldId": "name"}},
                {"metadata": {"type": "FormField", "fieldId": "name", "label": "dup"}},
                {"metadata": {"type": "Button", "actionId": "print", "label": "Print"}},
                {"metadata": {"type": "Button", "actionId": "noLabel"}},
            ],
        }}]}
        s = mcp.project_increment(inc)
        self.assertEqual([f["id"] for f in s["fields"]], ["name"])
        self.assertEqual(s["fields"][0]["label"], "name")
        self.assertEqual(s["fields"][0]["value"], "Ada")  # from initialData when no state
        a = {x["id"]: x for x in s["actions"]}
        self.assertEqual(list(a), ["save", "docs", "print", "noLabel"])
        self.assertEqual(a["docs"]["href"], "https://x")
        self.assertEqual(a["print"]["label"], "Print")
        self.assertEqual(a["noLabel"]["label"], "noLabel")

    def test_title_falls_back_to_the_page_then_the_listing(self):
        page = {"fragments": [{"component": {"metadata": {"type": "Page", "title": "Page T", "subtitle": "S"}}}]}
        self.assertEqual(mcp.project_increment(page)["title"], "Page T")
        self.assertEqual(mcp.project_increment(page)["subtitle"], "S")
        crud = {"fragments": [{"component": {"metadata": {"type": "Crudl", "title": "Books", "subtitle": "all",
                                                           "columns": [{"metadata": {"fieldId": "t", "label": "Title"}}, {}]}}}]}
        s = mcp.project_increment(crud)
        self.assertEqual(s["title"], "Books")
        self.assertEqual(s["subtitle"], "all")
        self.assertEqual(s["listing"]["columns"], [{"id": "t", "label": "Title"}])

    def test_a_message_without_variant_is_info(self):
        s = mcp.project_increment({"messages": [{"message": "hi"}]})
        self.assertEqual(s["messages"], [{"text": "hi", "type": "info"}])


if __name__ == "__main__":
    unittest.main()
