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
**SAP**/**Oracle**/**Vaadin** user interfaces. In the end, Mateu's frontends are just web components which you can embed anywhere, indeed. 

E.g. you can use the **Redwood** frontend if you want your microfrontends to be embedded in/coexist with existing **Oracle** UIs, or choose
the **SAPUI5/OpenUI5** frontend if you want your microfrontends to be embedded in/coexist with existing **SAP** UIs, or 
choose **Vaadin** just because you like it.

I imagine I do not need to say this but, obviously, you can also serve your applications in a **standalone** mode without 
embedding them in existing **SAP**/**Oracle**/**Vaadin** web user interfaces. In fact, changing the design system for your 
**Mateu**-based UIs is as easy as just changing a maven dependency. 

I have used the components which are open source / free to use from each design system, and complemented it with my own 
ones when it was necessary, to allow you to use any of them wherever. I will double-check before releasing the version 3 of Mateu, anyway.

## SAPUI5/OpenUI5 

<p align="center"><img src="../../../images/phenix_blue.svg?raw=true" width="60"/></p>

<p align="center"><img src="../../../images/basic-form-sapui5.png?raw=true" width="600"/></p>

I have always loved the SAP UI5 design system. It's clean and a perfect fit for any enterprise application.

By using this design system you should be able to easily integrate your UIs built with Mateu in any SAP web UI.

## Oracle Redwood

<p align="center"><img src="../../../images/oracle_redwood_1.webp?raw=true" width="200"/></p> 

<p align="center"><img src="../../../images/basic-form-redwood.png?raw=true" width="600"/></p >

## Vaadin 

<p align="center"><img src="../../../images/vaadin-logo.svg?raw=true" width="70"/></p>

<p align="center"><img src="../../../images/basic-form-vaadin.png?raw=true" width="600"/></p>

## Bring your own design system

You know, you just need to create a frontend which consumes the Mateu API. As easy as that. 

You can take any of the frontend project from the repository and start from there, if you want something quick.
