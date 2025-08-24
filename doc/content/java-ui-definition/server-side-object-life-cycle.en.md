---
title: "Server-side object life-cycle"
weight: 65
---

As we have seen in the previous chapters the UI is backed by objects in the server side. We have also seen that, unless 
we define them as singletons, those server-side can are ephimeral and they are created and die with every request as the
nature of Mateu is stateless in the server side. 

That stateless nature is mandatory if we want to live in the micro services world, were nodes are created and destroyed 
at any moment and load is balanced among multiple nodes, so we do not know who will handle our requests.   

So, the life cycle of the objects in the server side is as follows:

1. Mateu receives a call from the browser for performing an action, for a component
2. Mateu gets an instance of the object with the class corresponding to that component  
3. Mateu hydrates the object with the values from the component state
4. If the HasPostHydratationMethod interface is implemented, the postConstruct method is called
5. The required method in the object is called
6. The return is mapped to a Mateu dto
7. The dto multilanguage contents (labels) is translated
8. The dto is sent back to the browser and rendered

## 2. Object instantiation

Please notice that Mateu first looks for a bean from the underlying framework (Springboot, Quarkus, Micronaut, Helidon). 
If the application context does not return a bean, then Mateu creates an instance which will live only for this request.

When creating an instance, Mateu first looks for a constructor which matches the values in the component state. This is 
usually the case for Java records. If that constructor does not exist, then the default constructor with no parameters 
is used.

## 3. Hydratation

This only happens if Mateu has not found a constructor with parameters matching the state values. Setters are used if available. 

## 4. HasPostHydratationMethod

If the object implements the HasPostHydratationMethod interface, then the postHydratation method is called.

This is usually used to read parameters or headers from the http request.

## 5. Method is called

If the object implements the HandlesActions interface then the handleAction method is called, otherwise the method with 
the same name as the action id will be called.

## 6. Map result to a DTO

In case null is returned then the object itself will be serialised as the new component state.
