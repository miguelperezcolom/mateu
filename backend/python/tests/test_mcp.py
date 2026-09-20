"""Pure projection + JSON-RPC tests for the Python MCP host (the agent-operability plane, P4).

Loads ``mateu_core/mcp.py`` in isolation (it only needs stdlib), so it runs with plain ``python3``
— ``python3 -m unittest tests.test_mcp`` — without pydantic/fastapi. It is the Python twin of the
sidecar's projection.test.mjs and the Java McpProjectionTest.
"""

import importlib.util
import unittest
from pathlib import Path

_mcp_path = Path(__file__).resolve().parents[1] / "mateu_core" / "mcp.py"
_spec = importlib.util.spec_from_file_location("mateu_mcp_under_test", _mcp_path)
mcp = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(mcp)


class ProjectionTest(unittest.TestCase):
    def test_fields_types_options_values_and_title(self):
        inc = {
            "wireVersion": "3.0",
            "commands": [{"type": "SetWindowTitle", "data": "Simple form"}],
            "fragments": [{
                "component": {
                    "type": "ServerSide", "route": "_empty", "serverSideType": "com.acme.F", "pageType": "form",
                    "children": [
                        {"type": "ClientSide", "metadata": {"type": "FormField", "fieldId": "name", "label": "Name", "dataType": "string", "required": True}},
                        {"type": "ClientSide", "metadata": {"type": "FormField", "fieldId": "colour", "label": "Colour", "stereotype": "select",
                                                            "options": [{"value": "red", "label": "red"}, {"value": "green", "label": "green"}]}},
                    ],
                },
                "state": {"name": "Ada", "colour": "green"},
            }],
        }
        s = mcp.project_increment(inc)
        self.assertEqual(s["title"], "Simple form")
        self.assertEqual(s["route"], "")  # _empty normalised
        self.assertEqual(s["wireVersion"], "3.0")
        by = {f["id"]: f for f in s["fields"]}
        self.assertEqual(by["name"]["dataType"], "string")
        self.assertTrue(by["name"]["required"])
        self.assertEqual(by["name"]["value"], "Ada")
        self.assertEqual(by["colour"]["stereotype"], "select")
        self.assertEqual([o["value"] for o in by["colour"]["options"]], ["red", "green"])

    def test_actions_ids_from_serverside_labels_from_buttons(self):
        inc = {"fragments": [{"component": {
            "type": "ServerSide", "route": "editor", "serverSideType": "com.acme.E",
            "actions": [{"id": "save", "confirmationRequired": True, "shortcut": "ctrl+s"}, {"id": "cancel"}],
            "children": [{"type": "ClientSide", "metadata": {"type": "Button", "actionId": "save", "label": "Guardar"}}],
        }, "state": {}}]}
        s = mcp.project_increment(inc)
        a = {x["id"]: x for x in s["actions"]}
        self.assertEqual(a["save"]["label"], "Guardar")
        self.assertEqual(a["save"]["shortcut"], "ctrl+s")
        self.assertTrue(a["save"]["confirmationRequired"])
        self.assertEqual(a["cancel"]["label"], "cancel")

    def test_crudl_projects_columns_searchable_filters(self):
        inc = {"fragments": [{"component": {
            "type": "ServerSide", "route": "products", "serverSideType": "com.acme.P",
            "children": [{"type": "ClientSide", "metadata": {"type": "Crudl", "title": "Products", "searchable": True,
                "columns": [{"metadata": {"id": "name", "caption": "Name"}}, {"metadata": {"id": "price", "caption": "Price"}}],
                "filters": [{"fieldId": "category", "label": "Category", "dataType": "string"}]}}],
        }}]}
        s = mcp.project_increment(inc)
        self.assertTrue(s["listing"]["searchable"])
        self.assertEqual([c["id"] for c in s["listing"]["columns"]], ["name", "price"])
        self.assertEqual(s["listing"]["filters"][0]["id"], "category")

    def test_navigation_commands_surfaced(self):
        s = mcp.project_increment({"commands": [{"type": "navigateTo", "data": "/thanks"}, {"type": "SetWindowTitle", "data": "x"}], "fragments": []})
        self.assertEqual(s["commands"], [{"type": "navigateTo", "data": "/thanks"}])

    def test_empty_increment_does_not_raise(self):
        s = mcp.project_increment({})
        self.assertEqual(s["fields"], [])
        self.assertEqual(s["actions"], [])

    def test_normalize_route(self):
        self.assertEqual(mcp.normalize_route("_empty"), "")
        self.assertEqual(mcp.normalize_route("/products"), "products")
        self.assertEqual(mcp.normalize_route(None), "")


class JsonRpcTest(unittest.TestCase):
    def _sync_fn(self, route, action_id, state, params):
        # a fake backend: echoes what was asked as a minimal increment
        return {"wireVersion": "3.0", "fragments": [{"component": {
            "type": "ServerSide", "route": route or "_empty", "serverSideType": "com.acme.X",
            "actions": [{"id": action_id}] if action_id else [],
        }, "state": state or {}}]}

    def test_initialize(self):
        r = mcp.handle_jsonrpc({"id": 1, "method": "initialize"}, self._sync_fn)
        self.assertEqual(r["result"]["serverInfo"]["name"], "mateu-mcp")
        self.assertTrue(r["result"]["protocolVersion"])

    def test_tools_list(self):
        r = mcp.handle_jsonrpc({"id": 2, "method": "tools/list"}, self._sync_fn)
        names = sorted(t["name"] for t in r["result"]["tools"])
        self.assertEqual(names, ["mateu_describe_screen", "mateu_list_routes", "mateu_run_action", "mateu_search"])

    def test_tools_call_describe(self):
        import json
        r = mcp.handle_jsonrpc({"id": 3, "method": "tools/call", "params": {"name": "mateu_describe_screen", "arguments": {"route": "editor"}}}, self._sync_fn)
        screen = json.loads(r["result"]["content"][0]["text"])
        self.assertEqual(screen["serverSideType"], "com.acme.X")

    def test_tool_error_is_iserror_result(self):
        def boom(*_):
            raise RuntimeError("boom")
        r = mcp.handle_jsonrpc({"id": 4, "method": "tools/call", "params": {"name": "mateu_run_action", "arguments": {"route": "x", "actionId": "y"}}}, boom)
        self.assertTrue(r["result"]["isError"])
        self.assertIn("boom", r["result"]["content"][0]["text"])

    def test_notification_yields_none(self):
        self.assertIsNone(mcp.handle_jsonrpc({"method": "notifications/initialized"}, self._sync_fn))

    def test_unknown_method(self):
        r = mcp.handle_jsonrpc({"id": 9, "method": "nope/nope"}, self._sync_fn)
        self.assertEqual(r["error"]["code"], -32601)


if __name__ == "__main__":
    unittest.main()
