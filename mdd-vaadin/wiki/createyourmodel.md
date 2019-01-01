For creating a mateu-mdd application you basically have 2 tasks:

1. create a model
1. define your app structure and menus

This chapter focuses on the first point.

You can create the model using JPA, a relational database, a nosql database or POJOS.

## JPA

In short, JPA is a java specification which states how to persist your java objects (entities) to a database and how to later recover them.

Basically you use one object (an instance of EntityManager) to save and restore objects to and from your database. 

You define which objects are persistible by annotating their class with the @Entity annotation, and you can refine the mapping by annotating your class fields.


## Create our JPA entities

If you are still here it means that you want to create views to maintain your JPA entities.

From now on you should be familiar to JPA (Java Persistence Api).


So, you must first create your entities. For instance:

```java

package com.example.model;

import javax.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.Id;

/**
 * holder for currencies
 *
 * Created by miguel on 13/9/16.
 */
@Entity
@Getter@Setter
public class Currency {

    @Id
    @NotNull
    private String isoCode;

    private String iso4217Code;

    @NotNull
    private String name;

    private int decimals;
}

```

So far we have our first model entity.

JPA will create the database table for us. We do not need to do anything else.

## Add the menu option

The only thing left for us is to show a menu option so the user can create, modify or delete currencies.

To do it we must just add the option in our application menu:


```java

public class MyApp extends SimpleMDDApplication {


    @Action
    public AbstractAction mascotas() {
        return new MDDOpenCRUDAction("Mis mascotas", Mascota.class);
    }


}

```


## Run our app

Now we can run our app by issuing

    mvn jetty:run

And now we show the result when we run Mateu-MDD against our model. First, the list view which is accesible by a link `Currencies` shown in the `Admin` menu:

![](https://github.com/miguelperezcolom/mateu-mdd/blob/master/doc/images/mdd02.png?raw=true)

And now the editor view, which is shown when we click on the link to edit a record:

![](https://github.com/miguelperezcolom/mateu-mdd/blob/master/doc/images/mdd03.png?raw=true)


Quite easy and straightforward, isn't it?

## Non basic fields

Now, let's see what happens when we reference the entity Currency from another entity.

Let's have a look at this other class which references our Currency class in a ManyToOne relationship:

```java

/**
 * holder for customers (e.g. a touroperator, a travel agency, ...)
 *
 * Created by miguel on 13/9/16.
 */
@Entity
@Getter
@Setter
public class Actor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Required
    private String name;

    private String businessName;

    private String address;

    @ManyToOne
    private Currency currency;

    private PurchaseOrderSendingMethod ordersSendingMethod;
    
    ...

}


```


The result is quite convenient:

![](https://github.com/miguelperezcolom/mateu-mdd/blob/master/doc/images/mdd04.png?raw=true)


Mateu-MDD has been clever enough to detect that we are referencing a Currency entity and is showing a combo box to let us choose which Currency is the right one.

Perfect. This is exactly what I expect to see.

Note how Mateu-MDD has also inferred a combo box for the PurchaseOrderSendingMethod enumeration:

![](https://github.com/miguelperezcolom/mateu-mdd/blob/master/doc/images/mdd05.png?raw=true)


If we annotate the currency field with the @NotNull annotation then Mateu MDD will add a required indicator to the combo box and will check if it has some value before saving.

![](https://github.com/miguelperezcolom/mateu-mdd/blob/master/doc/images/mdd05.png?raw=true)


Everything in Mateu-MDD works in this way. It looks at our java classes using java reflection and infers the right component for each field.


## Limiting possible values for a field

By default Mateu MDD will fill combo boxes for us with all the possible values.

If our field is an enumeration field then all values of the enumeration will be used to fill the combo box and, if it is a @ManyToOne field a JQPL query will be used to get all of the target entities and fill the combo.

Even if our field is an int, double or String field we could also be interested on limiting the possible values that the user can enter in our field.

With Mateu MDD it is easy to achive this just by adding a method to our class:

````java
    
    private String stringField;
    
    public DataProvider getStringFieldDataProvider() {
        return new ListDataProvider(
                Lists.newArrayList("Rojo", "Verde", "Azul", "Amarillo")
                );
    }

    
````

This will limit the possible values as shown in this screenshot:

![](https://github.com/miguelperezcolom/mateu-mdd/blob/master/doc/images/mdd10.png?raw=true)

And here you have another sample code, this time limiting the values we get from a database table by using JPQL:

````java

    @ManyToOne
    private State state;

    @ManyToOne
    private City city;
    
    @DependsOn("state")
    public DataProvider getCityDataProvider() throws Throwable {
        return new JPQLListDataProvider("select x from " + 
          City.class.getName() + " x " + 
          ((getState() != null)?" where x.state.id = " + getState().getId():""));
    }

````

Please note that in the code above we are telling Mateu MDD to filter the city field possible values depending on the state field value.

The @DependsOn annotation tells Mateu MDD that he must look at state field value changes and update the city field combo accordingly.

This way our city field combo will always only show the cities which belong to the selected state.

## Decide if a field (or action) is visible or not

In our model we usually have fields (or actions) which must be shown to the user or not depending on some values.

With Mateu MDD we would usually achive this by adding a new method to our model class, which will tell Mateu MDD if the field (or action) must be visile or not.

Here comes an example:

````java

    @Action
    public void confirm(EntityManager em) {
        setActive(true);
    }

    @DependsOn("active")
    public boolean isConfirmVisible() {
        return !isActive();
    }

````

In the example above the button for the "Confirm" action will be visible only when the active field is false.

Please note the @DependsOn annotation which tells Mateu MDD that the "Confirm" action visibility must be checked whenever the active field value changes.


## Nested (dependant on other) values

So far we have already seen the @DependsOn anotation, which we can use to annotate any method which we want to be called when a field or set of fields change.

Please let me repeat a previous example:

````java

    @ManyToOne
    private State state;

    @ManyToOne
    private City city;
    
    @DependsOn("state")
    public DataProvider getCityDataProvider() throws Throwable {
        return new JPQLListDataProvider("select x from " + 
          City.class.getName() + " x " + 
          ((getState() != null)?" where x.state.id = " + getState().getId():""));
    }

````

This becomes the typical nested combo boxes:

![](https://github.com/miguelperezcolom/mateu-mdd/blob/master/doc/images/mdd10.png?raw=true)

Whenever we change the state value, the city combo is updated.


## Changing the default component of a field




## Refining the presentation

Besides looking at JPA annotations and at field types, Mateu-MDD provides additional annotations so we can modify the default behavior.

With these annotations we can group fields inside a tab panel, we can say which fields are required, and more things.

There is a complete list of the supported annotations at the end of this manual.

  

## Collection fields

Besides single value fields we can have collection fields. E.g. a List or a Map.

When this happens Mateu-MDD will perform in different ways according to the context.

If a list is annotated with the @ElementCollection annotation Mateu-MDD will infer a textarea and will translate each line inside the text to values inside our list.

E.g.

```java

    @ElementCollection
    private List<String> aliases = new ArrayList<>();

```

Will result in:

![](https://github.com/miguelperezcolom/mateu-mdd/blob/master/doc/images/mdd06.png?raw=true)


If it is a list annotated with the @OneToMany or with the @ManyToMany annotations Mateu-MDD will infer a list builder to let the user choose which element to include in the list.

With this code:

```java

    @OneToMany
    private List<Actor> targets = new ArrayList<>();


```

We will see:

![](https://github.com/miguelperezcolom/mateu-mdd/blob/master/doc/images/mdd07.png?raw=true)


If we annotate the list with the @Output annotation Mateu-MDD will infer a table to show the list contents.



If we annotate our list with the @Owned annotation Mateu-MDD will create a table with the options to add, edit or remove the records.



In both cases (@Table and @Owned) we can filter which columns must be shown and we can state which columns must be totalized.  



## Map

For map containers Mateu-MDD infers a table with the map key as the first column and the map value fields inside the rest of columns.

## Ignore fields

If you want Mateu-MDD to ignore a field you just need to annotate it with the @Ignored annotation.



## Exposing methods

Another special and interesting use case is when you want to publish a method so the user can call it.

By annotating a method with the @Action annotation Mateu-MDD will infer a button in the view.

If the method is an static method inside a JPA entity Mateu-MDD will show the button at the list view of the CRUD, while if it is a non-static method Mateu-MDD will shoe the button at the editor view of the CRUD.

For instance

```java

    @Action(name = "Purchase")
    public void checkPurchase(EntityManager em) throws Throwable {
        if (!isAlreadyPurchasedBefore() && isAlreadyPurchased()) {
...

        } else {
            throw new Throwable("Nothing changed. No need to purchase again");
        }
    }

```

Will generate:

![](https://github.com/miguelperezcolom/mateu-mdd/blob/master/doc/images/mdd08.png?raw=true)


Note that if the method throws an exception an error message will be shown to the user.


If the method has parameters Mateu-MDD will show a dialog asking the user to enter the values.

For instance:

```java

    @Action(name = "Send pickup times")
    public static void sendPickupTimes(
              EntityManager em, 
              @Parameter(name = "Email")@Required String toEmail, 
              @Parameter(name = "Msg") String msg
         ) throws Throwable {
        
        ...

    }
```

Will result in:

![](https://github.com/miguelperezcolom/mateu-mdd/blob/master/doc/images/mdd09.png?raw=true)


There are some special parameters that Mateu-MDD treats in an special way:

entitymanager
userdata
List<selection>
Data en estático -> parámetros
Data en no estático -> datos

And there are some return values which are treated in an special way:

Data


## End

So far we have seen how to expose our data model to a UI, we have seen what Mateu-MDD infers in some usual use cases and we have also seen how to publish methods so the user can call our server side logic.

In next chapters we will look at some special cases like views and wizards.

And remember you can see the whole possibilities at [http://mdddemo.mateu.io/](http://mdddemo.mateu.io/) and you can have a look at the complete supported annotations list at [Supported annotations list](Supported-annotations-list).




***

Continue with the manual at [organize your app](Organize-your-app).
