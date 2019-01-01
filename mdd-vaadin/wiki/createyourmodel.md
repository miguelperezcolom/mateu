For creating a mateu-mdd application you basically have 2 tasks:

1. create a model
1. define your app structure and menus

This chapter focuses on the first point.

You can create the model using JPA or POJOS.

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

![](https://github.com/miguelperezcolom/mateu-mdd/blob/master/doc/images/mdd10b.png?raw=true)


Everything in Mateu-MDD works in this way. It looks at our java classes using java reflection and infers the right component for each field.



## Collection fields

Besides single value fields we can have collection fields. E.g. a List, Set or Map.

When this happens Mateu-MDD will perform in different ways according to the context.

For primitive collections (or primitive arrays like int[] or String []) Mateu MDD will infer a text field and he will expect comma separated values for the collection.

If we annotate our primitive collection with [@TextArea](Supported-annotations-list#textarea) then Mateu MDD will infer a textarea where each line will match a collection value.

If a list of primitive values is annotated with the @ElementCollection annotation Mateu-MDD will infer a textarea and will translate each line inside the text to values inside our list.

E.g.

```java

    @ElementCollection
    private List<String> aliases = new ArrayList<>();

```

Will result in:

![](https://github.com/miguelperezcolom/mateu-mdd/blob/master/doc/images/mdd06.png?raw=true)


If our collection holds values other than primitive ones Mateu MDD will behave depending on several factors.

For collections annotated with @ElementCollection and for owned collections (e.g. collection of POJOS or @OnetoMany and @ManyToMany annotated entity collections with Cascade.ALL) Mateu MDD will infer an editable grid if he can (e.g. if all of the target collection type fields are primitive, enumeration or annotated with @ManyToOne).

If the collection target type is a more complex one (e.g. it has collection fields) Mateu MDD will infer a non editable grid with **add* and **remove** buttons, so when we choose to add a new item, or when we edit an item by double clicking it on the grid, a new screen will be shown where we can edit our items and navigate the collection.

If the collection target type holds entities (e.g. we are talking about a @OneToMany or @ManyToMany annotated collection field) then a non editable will also be inferred, but the **add** button will offer a CRUD list view so we can search and select which entities we want to add to our collection (or even create them if we need to). If our parent entity owns the child entity (the @OneToMany or @ManyToMany annotation cascade parameter is set to ALL) then an editable grid will be inferred if possible (if all child fields are primitive, enumeration or @ManyToOne) or a non editable grid which takes us to a navigable editor.

Please note that reverse map fields (those marked with the **mappedBy** parameter of the @OneToMany and @ManyToMany annotations) are not shown as we aleady know who is that value.

Collection fields will also not be shown as columns of our grids.
 
We can also limit which columns are shown by using the [@FieldsFilter](Supported-annotations-list#fieldsfilter) annotation.



## Map

For map containers Mateu-MDD infers a table with the map key as the first column and the map value fields inside the rest of columns.

## Ignore fields

If you want Mateu-MDD to ignore a field you just need to annotate it with the [@Ignored](Supported-annotations-list#ignored) annotation.

If you only want to remove the field from the list view of the CRUD you can use the [@NotInList](Supported-annotations-list#notinlist) annotation and, if you do not want the field to appear inside the editor form you can annotate it with the [@NotinEditor](Supported-annotations-list#notineditor) annotation.

So, [@Ignored](Supported-annotations-list#ignored) is the same as using both [@NotInList](Supported-annotations-list#notinlist) and [@NotInEditor](Supported-annotations-list#notineditor) annotations.

Please note that you can also make a field not editable by annotating it with [@Output](Supported-annotations-list#output) or by annotating it with [@KPI](Supported-annotations-list#kpi) if you want it to be present at the KPIs section of the editor (enhanced at the top of the editor).


## Exposing methods

Another special and interesting use case is when you want to publish a method so the user can call it.

By annotating a method with the [@Action](Supported-annotations-list#action) annotation Mateu-MDD will infer a button in the view.

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

- by declaring a parameter of type **EntityManager** Mateu MDD encloses the method call inside a JPA transaction and the current EntityManager is passed indise this parameter  
- any parameter of type **UserData** will be injected with the current user session data
- any parameter of type **Set&lt;T>** inside an static method of any class will be filled with the selected entities from the list view of a CRUD 

And there are some return values which are treated in an special way:

- **URL** return type will open the result in a new navigator tab
- **Any Object** return type will open an editor for that object


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

![](https://github.com/miguelperezcolom/mateu-mdd/blob/master/doc/images/mdd10c.png?raw=true)

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

The [@DependsOn](Supported-annotations-list#dependson) annotation tells Mateu MDD that he must look at state field value changes and update the city field combo accordingly.

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

Please note the [@DependsOn](Supported-annotations-list#dependson) annotation which tells Mateu MDD that the "Confirm" action visibility must be checked whenever the active field value changes.


## Nested (dependant on other) values

So far we have already seen the [@DependsOn](Supported-annotations-list#dependson) anotation, which we can use to annotate any method which we want to be called when a field or set of fields change.

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

![](https://github.com/miguelperezcolom/mateu-mdd/blob/master/doc/images/mdd11.png?raw=true)

Whenever we change the state value, the city combo is updated.


## Changing the default component for a field

We could think that radio buttons would be a better choice for a @ManyToOne field (e.g. if we know that the number of possible values is limited).

This is easily accomplished by using the [@UseRadioButtons](Supported-annotations-list#useradiobuttons) annotation:

````java

    @UseRadioButtons
    @ManyToOne
    private ManyToOneFieldDemoDestinationEntity usingRadioButtons;


````

The result for the code above is this:

![](https://github.com/miguelperezcolom/mateu-mdd/blob/master/doc/images/mdd12.png?raw=true)


We could also think that a list of checkboxes is better for a @OneToMany field and we must just use the [@UseCheckboxes](Supported-annotations-list#usecheckboxes) annotation to achive it:

````java

    // crea un checkbox para cada elemento posible
    @OneToMany
    @UseCheckboxes
    @JoinTable(name = "onetomanywithcheckboxes")
    private Set<OneToManyChildEntity> withCheckboxes = new HashSet<>();

````

The code above will be inferred as:

![](https://github.com/miguelperezcolom/mateu-mdd/blob/master/doc/images/mdd13.png?raw=true)


Another options that are available for collection fields are using twin cols component (by using the [@UseTwinCols](Supported-annotations-list#usetwincols) annotation), or showing only a little text (e.g. something like "2 items") plus an "edit" button by using the [@UseLinkToListView](Supported-annotations-list#uselinktolistview) annotation.

Here follows a [@UseLinkToListView](Supported-annotations-list#uselinktolistview) annotated @OneToMany collection:

![](https://github.com/miguelperezcolom/mateu-mdd/blob/master/doc/images/mdd14.png?raw=true)

And this would be the code for a lazy collection:

````java

    // enseña un link que abre un buscador con el listado, desde el que podemos abrir otro buscador para añadir elementos
    @OneToMany
    @UseLinkToListView(addEnabled = true, deleteEnabled = true)
    private List<OneToManyChildEntity> lazyChildren = new ArrayList<>();

````

And this is the result for the code above:

![](https://github.com/miguelperezcolom/mateu-mdd/blob/master/doc/images/mdd15.png?raw=true)


The [@UseLinkToListView](Supported-annotations-list#uselinktolistview) will by default show a list view based on the target entity definition (fields and annotations) but we can show a different list view it by using the listView parameter of the [@UseLinkToListView](Supported-annotations-list#uselinktolistview) annotation.

````java

    @UseLinkToListView(listViewClass = CustomListView.class)
    @ManyToOne
    private ManyToOneFieldDemoDestinationEntity usingCustomListView;

````

We can also hide the "edit" button if we also use the [@Output](Supported-annotations-list#output) annotation for our collection field:

````java

    // enseña un link que abre un buscador con el listado, desde el que podemos abrir otro buscador para añadir elementos
    @OneToMany
    @UseLinkToListView
    @Output
    private List<OneToManyChildEntity> lazyChildren = new ArrayList<>();

````

We can even change the default "1 items" message by creating a getXXXHtml method inside our class.

````java

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "booking")
    @Position(9)
    private List<HotelBookingLine> lines = new ArrayList<>();

    public String getLinesHtml() {

        String h = "<div class='lines'>";
        for (HotelBookingLine l : lines) {
            h += "<div class='line" + (l.isActive() ? "" : " cancelled") + "'>";
            h += l.toString();
            h += "</div>";
        }
        h += "</div>";

        return h;
    }



````

If we want to use less space for our collection editor we could use chips by annotating our collection with [@UseChips](Supported-annotations-list#usechips):

````java

    // crea un chip para cada elemento seleccionado
    @OneToMany
    @UseChips
    @JoinTable(name = "onetomanywithchips")
    private Set<OneToManyChildEntity> withChips= new HashSet<>();

````

This is the result for the code above:

![](https://github.com/miguelperezcolom/mateu-mdd/blob/master/doc/images/mdd16.png?raw=true)


## Change our form fields disposition

Mateu MDD will by default show all of our editor form fields in a vertical layour.

We can group our fields in sections by using the [@Section](Supported-annotations-list#section) annotation in any of our fields. All fields from that point will be included in a separate section, until a new [@Section](Supported-annotations-list#section) annotation is found or until there are not more fields.

Sections are displayed in a flex layout, while fields inside sections are displayed in a vertical layout.

We can also use tabs for grouping our fields. We only need to add the [@Tab](Supported-annotations-list#tab) annotation on the first field of each tab.

If we want to change the order for fields we just need to use the [@Position](Supported-annotations-list#position) annotation.


## Change the default field editor component

We can change the default field editor component (e.g. a text field for strings, or a combo box for @ManyToOne fields) for the whole application or for a particular field of a particular class.

````java


@Caption("My simple app")
public class MyApp extends SimpleMDDApplication {

    ...

    @Override
    public AbstractFieldBuilder getFieldBuilder(FieldInterfaced field) {
        
        /*
        here we return our custom field builder depending on the
        field type, field name, annotations present
        or if it is field X of class Y
        */
        
        return ...;
    }
    
}

````

Remember that we can also show or open our custom Vaadin components as shown at [custom vaadin components](Custom-Vaadin-components).

## When we do not want to pollute our entities

Perhaps we do not want to pollute our model entities with so many annotations, or we can not modify our entities because they come from a different project, or perhaps we think that our model classes do not have to hold presentation related annotations, or perhaps what we want to show to our users is so much different from our model than if becomes too much complicated to achieve the desired presentation just by annotating our model class.

For such cases we can create our persistent pojos adapted to our presentation and code by hand the way they modify our model classes.

This is explained at the ["Create POJOs" chapter of MDD](https://github.com/miguelperezcolom/mateu-mdd/wiki/MDD#create-pojos).

  
## End

So far we have seen how to expose our data model to a UI, we have seen what Mateu-MDD infers in some usual use cases and we have also seen how to publish methods so the user can call our server side logic.

In next chapters we will look at some special cases like views and wizards.

And remember you can see the whole possibilities at [http://mdddemo.mateu.io/](http://mdddemo.mateu.io/) and you can have a look at the complete supported annotations list at [Supported annotations list](Supported-annotations-list).




***

Continue with the manual at [organize your app](Organize-your-app).
