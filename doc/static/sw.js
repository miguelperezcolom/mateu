self.addEventListener('install', (event) => {
  console.log('install 2', event);
});

self.addEventListener('activate', function(event) {
  console.log('activate 2');
  self.clients.claim();
});


async function handle(event, title) {
  let clonedBody = await event.request.clone().json();
  let componentId = clonedBody.initiatorComponentId;
  let data = JSON.stringify({
    "fragments": [
      {
        "targetComponentId": componentId,
        "component": {
          "type": "ServerSide",
          "id": "component_id",
          "serverSideType": "com.example.demo.infra.in.ui.antonia.Page1",
          "children": [
            {
              "type": "ClientSide",
              "children": [
                {
                  "type": "ClientSide",
                  "children": [
                    {
                      "type": "ClientSide",
                      "metadata": {
                        "type": "FormField",
                        "fieldId": "name",
                        "dataType": "string",
                        "stereotype": "stereotype",
                        "observed": false,
                        "autofocus": false,
                        "label": "Name",
                        "placeholder": "placeholder",
                        "cssClasses": "css_classes",
                        "description": "description",
                        "colspan": 0,
                        "rightAligned": false,
                        "bold": false,
                        "bindToData": true,
                        "required": false
                      },
                      "id": "field_id"
                    },
                  ],
                  "metadata": {
                    "type": "FormLayout",
                    "autoResponsive": false,
                    "labelsAside": false,
                    "maxColumns": 0,
                    "expandColumns": false,
                    "expandFields": false
                  }
                }
              ],
              "metadata": {
                "type": "Form",
                "actions": [
                  {
                    "id": "printHello",
                    "validationRequired": false,
                    "confirmationRequired": false,
                    "rowsSelectedRequired": false,
                    "target": "Component",
                    "background": false
                  },
                  {
                    "id": "sayHello",
                    "validationRequired": false,
                    "confirmationRequired": false,
                    "rowsSelectedRequired": false,
                    "target": "Component",
                    "background": false
                  },
                  {
                    "id": "showPage2",
                    "validationRequired": false,
                    "confirmationRequired": false,
                    "rowsSelectedRequired": false,
                    "target": "Component",
                    "background": false
                  },
                  {
                    "id": "goToPage2",
                    "validationRequired": false,
                    "confirmationRequired": false,
                    "rowsSelectedRequired": false,
                    "target": "Component",
                    "background": false
                  }
                ],
                "icon": "icon",
                "title": title,
                "readOnly": false,
                "subtitle": "This is a simple subtitle"
              }
            }
          ],
          "initialData": {
            "title": "Page 1",
            "subtitle": "This is a simple subtitle"
          }
        },
        "state": {
          "name": null,
          "age": 0,
          "title": "Page 1",
          "subtitle": "This is a simple subtitle"
        },
        "action": "Replace"
      }
    ]
  });
  return new Response(data, {
    headers: {'Content-Type': 'application/json'}
  });

}

async function handleNoRoute(event) {
  let clonedBody = await event.request.clone().json();
  let componentId = clonedBody.initiatorComponentId;
  let data = JSON.stringify({
    "fragments": []
  });
  return new Response(data, {
    headers: {'Content-Type': 'application/json'}
  });

}

self.addEventListener("fetch", (event) => {
  if (event.request.url.endsWith('mateu/v3/page1')) {
    event.respondWith(handle(event, 'Page 1'));
  }
  if (event.request.url.endsWith('mateu/v3/page2')) {
    event.respondWith(handle(event, 'Page 2'));
  }
  if (event.request.url.endsWith('mateu/v3/_no_route')) {
    event.respondWith(handleNoRoute(event));
  }
});

