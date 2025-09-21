---
title: "Design Systems"
#icon: "/images/icons/start.svg" # https://fonts.google.com/icons
#icon_bg: ""
description: "amet nisl tempus convlis quis ac lectus. Vivsdv amus mana justo, lacinia eget"
weight: 40

# don't create a separete form
type: "docs"
_build:
  list: always
  publishResources: true
  render: always
---

Mateu provides several frontends using different design systems, so you can choose he one which you like most / fits 
your needs. This allows you to easily create with **Mateu** your **micro frontends** which you can easily embed in existing
**Red Hat**/**SAP**/**Oracle**/**Vaadin** user interfaces. In the end, Mateu's frontends are just web components which you can embed anywhere, indeed. 

E.g. you can use the **Redwood** frontend if you want your microfrontends to be embedded in/coexist with existing **Oracle** UIs, or choose
the **SAP Fiori** frontend if you want your microfrontends to be embedded in/coexist with existing **SAP** UIs, or 
choose **Red Hat** or **Vaadin** just because you like it (like I do).

I imagine I do not need to say this but, obviously, you can also serve your applications in a **standalone** mode without 
embedding them in existing **Red Hat**/**SAP**/**Oracle**/**Vaadin** web user interfaces. In fact, changing the design system for your 
**Mateu**-based UIs is as easy as just changing a maven dependency. 

For some of the frontends I have used the components which are open source / free-to-use from each design system, and provided my own alternate 
components when the design system ones were under a restrictive licensing model, to allow you to use Mateu wherever. I 
will double-check before releasing the version 3 of Mateu, anyway.

SAP Fiori is a different case, and you will need a valid SAP license including SAP Fiori in case you want to use that frontend.
