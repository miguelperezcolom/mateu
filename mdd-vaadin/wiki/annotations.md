Mateu MDD looks at annotations to know how to show your model.

There are three groups of annotations supported:

- Mateu MDD propietary annotations
- javax-validation annotations
- JPA annotations

# Propietary annotations list

## @Action
### Description
Use this annotation to publish a method. 
### Scope
METHOD
### Parameters
|Name|Description|
|---|---|
|value|Label for the button|
|icon|Icon for the button. Use VaadinIcons to choose one icon|
|callOnEnterKeyPressed|If true then it is called when the user presses the enter key while the form is focused|
|addAsAButton|If true it will be added as a button inside the form instead of being added at the form's toolbar|
|confirmationMessage|If not empty then a confirm dialog with this message will be shown to the user before performing the action|
|keepOpened|When set to true and shown in an editor, the editor will not be closed after action execution. By default we go back to the CRUD list|
|order|Order for showing in the action bar. Java reflection does not guarantee the order of methods when we ask for them|
|style|Set an style for this button. Use ValoTheme.BUTTON_xx values|
|saveBefore|when shown in an editor, save will be performed before action execution|
|saveAfter|when shown in an editor, save will be performed after action execution|

### Example

```java
    @Action(name = "test 2")
    public void test2() {
        log.debug("test 2!!!");
    }
```




## @Caption

### Description

Use it to state a label for the field / parameter

### Scope

FIELD, PARAMETER

### Parameters

|Name|Description|
|---|---|
|value|text to be shown|

### Example

```java
    @Action(name = "Test 1")
    public static void test1(@NotNull @Caption("First name") String a, 
                                           @Caption("Last name")String b) {
        log.debug("test1(" + a + ", " + b + ")");
    }
```




## @CellStyleGenerator

### Description

Use it to state a CellStyleGenerator for a field column.

### Scope

FIELD

### Parameters

|Name|Type|Description|
|---|---|---|
|value|Class|Class implementing the CellStyleGenerator interface|

### Example

```java
    @ListColumn
    @CellStyleGenerator(IconCellStyleGenerator.class)
    private String icon;
```





## @Code

### Description

Use it to tell Mateu MDD that it must use the AceEditor to edit this field

### Scope

FIELD

### Parameters

|Name|Type|Description|
|---|---|---|
|mode|String|The language. E.g. javascript, java, scala, ...|
|theme|String|The editor style. E.g. eclipse, github, terminal, textmate, ...|

### Example

```java
    @Code
    private String myCode;
```






## @ColumnWidth

### Description

Use it for setting a column width

### Scope

FIELD

### Parameters

|Name|Type|Description|
|---|---|---|
|value|double|The desired column with|

### Example

```java
    @ColumnWidth(150)
    @NotEmpty
    private String invoiceNumber;
```







## @DataProvider

### Description

Use it to set the possible values for a field. Tipically used for nested comboboxes, or fields visible or not depending on other fields values

### Scope

FIELD, PARAMETER

### Parameters

|Name|Type|Description|
|---|---|---|
|dataProvider|Class<? extends AbstractDataProvider>|The DataProvider class|
|itemCaptionGenerator|Class<? extends ItemCaptionGenerator>|The ItemCaptionGenerator class|

### Example

```java
    @DataProvider(dataProvider = MyDataProvider.class)
    private String stringField;
```








## @DependsOn

### Description

Use it to tell Mateu MDD to call this method each time one of the listed fields change

### Scope

METHOD

### Parameters

|Name|Type|Description|
|---|---|---|
|value|String|Comma separated list of fields to watch at|

### Example

```java
    @DependsOn("state")
    public DataProvider getCityDataProvider() throws Throwable {
        return new JPQLListDataProvider("select x from " + City.class.getName() + " x " 
                 + ((getState() != null)?" where x.state.id = " + getState().getId():""));
    }
```







## @EndTabs

### Description

Use it when you want to close a tabs element. By default it would be closed with te las field of the class.

### Scope

FIELD

### Parameters

None

### Example

```java

    @EndTabs
    private String address;

```








## @FieldBuilder

### Description

Use it when you want to override the default field builder.

### Scope

FIELD

### Parameters

|Name|Type|Description|
|---|---|---|
|value|Class<? extends AbstractFieldBuilder>|Your field builder class. Must extend the AbstractFieldBuilder class|

### Example

```java

    @FieldBuilder(MyFieldBuilder.class)
    private String anyValue;


```









## @FieldsFilter

### Description

Use it when you want to show only some fields on a child (Collection field) entity.

### Scope

FIELD

### Parameters

|Name|Type|Description|
|---|---|---|
|value|String|Comma separated list of fields to show|

### Example

```java

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "hotelContract")
    @FieldsFilter("date,amount,paid")
    private List<HotelContractDueDate> dueDates = new ArrayList<>();


```








## @FullWidth

### Description

Use it when you want to state that the annotated field must be full width (as wide as the screen).

### Scope

FIELD, PARAMETER, METHOD

### Parameters
None
### Example

```java

    @FullWidth
    @ElementCollection
    private List<String> akas = new ArrayList<>();

```




## @Help

### Description

Use it to state a help message for the annotated field.

### Scope

FIELD, PARAMETER

### Parameters

|Name|Type|Description|
|---|---|---|
|value|String|Help message|


### Example

```java

    @SearchFilter
    @Help("Full name of the user")
    private String name;

```






## @Html

### Description

Use it to tell Mateu MDD that it must use a RichTextArea to edit this field

### Scope

FIELD

### Parameters

None

### Example

```java
    @Html
    private String someHtmlValue;
```






## @HtmlCol

### Description

Use it to tell Mateu MDD that this field must be read as Html when shown in a grid

### Scope

FIELD

### Parameters

None

### Example

```java
    @HtmlCol
    @ColumnWidth(100)
    private String icons;
```










## @IFrame

### Description

Use it to tell Mateu MDD that this field holds an URL and must be shown as an Iframe inside the app

### Scope

FIELD, METHOD

### Parameters

None

### Example

```java
    @IFrame
    public static URL returnURLInIframe() throws MalformedURLException {
        return new URL("http://elpais.es");
    }
```





## @Ignored
### Description

Use it to state that a field should not be shown neither at the search list nor at the edition form.

### Scope

FIELD

### Parameters

None

### Example

```java

    @Ignored
    private String password;

```








## @Indelible

### Description

Use it to state that no "Delete" button should be shown.

### Scope

TYPE

### Parameters

None
### Example

```java

/**
 * Created by miguel on 28/4/17.
 */
@Entity(name = "Task")
@Getter
@Setter
@NewNotAllowed
@Indelible
public abstract class AbstractTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

```





## @Keep
### Description

Use it to state that a field value should remain when you choose to "save and create" a new object by using the Ctrl + Alt + S shortcut in an editor.

### Scope

FIELD

### Parameters

None

### Example

```java
    @ManyToOne
    @NotNull
    @Keep
    private User owner;

```





## @KPI
### Description

Use it to state that a field should be shown as a KPI in the list view or in the editor view

### Scope

FIELD

### Parameters

|Name|Type|Description|
|---|---|---|
|reversed|boolean|Set it when it is a boolean value and false means positive and true means negative|

### Example

```java
    @KPI
    private LocalDateTime lastLogin;

    @KPI
    private int failedLogins;
```






## @KPIInline
### Description

Use it to state that a field should be shown as a big KPI, typically inside a dashboard

### Scope

FIELD

### Parameters

|Name|Type|Description|
|---|---|---|
|reversed|boolean|Set it when it is a boolean value and false means positive and true means negative|
|style|String|For changing the style of this KPI|

### Example

```java
    @KPIInline(style = CSS.SUPERKPI)
    private int bookingsToday = 53;
```




## @ListColumn

### Description

Use it when you want to state that the annotated field should be used to create a column at the list view.

By default all simple fields will appear in the list view of a CRUD. You can use the @ListColumn annotation to state which fields must appear as columns in the list view.

If there is any field annotated with @ListColumn then only fields annotated with @ListColumn will appear as columns in the list vew.

Remember you ca use multiple @ListColumn annotations on the same field. You can do it when you want to show several nested fields as columns, by using the `field` parameter of the annotation.

### Scope

FIELD

### Parameters

|Name|Type|Description|
|---|---|---|
|value|String|The column caption|
|field|String|Use it when you want to show a nested field|

### Example

```java

    @ListColumn
    private String name;

    @ManyToOne
    @ListColumn(field = "leadname")
    @ListColumn(field = "created")
    private Booking booking;

```


## @MainSearchFilter

### Description

Use it to state that a field must appear as main search filter in the list vew of CRUDs.

Main search filters are the ones which appear in the list view. Other filters appear when you click on the "filters" button of the list view.

By default only the first 3 fields appear as main search filters. When you use the @MainSearchFilter annotation only these fields will appear as main search filters.

You can use several @MainSearchFilter annotations on the same field. You can do it when you want to show several nested fields as search filters, by using the `field` parameter of the annotation.

### Scope

TYPE

### Parameters

|Name|Type|Description|
|---|---|---|
|field|String|Use it for nested fields|


### Example

```java

    @ManyToOne(cascade = CascadeType.MERGE)
    @MainSearchFilter(field = "searchableContent")
    @NotNull
    @ListColumn
    private BankAccount account;

```

## @NewNotAllowed

### Description

Use it to avoid showing the "New" button in the list view.

### Scope

TYPE

### Parameters

None

### Example

```java

@Entity
@Getter@Setter
@NewNotAllowed
public class AuthToken {

    @Id
    private String id;

```



## @NoChart

### Description

Use it to avoid showing a chart in the list view.

By default Mateu MDD will create a chart for @ManytoOne and enumeration fields.

### Scope

FIELD

### Parameters

None

### Example

```java

    @NoChart
    private BookingStatus status;

```




## @NotInEditor

### Description

Use it when you want a field not to be shown in the editor view.

### Scope

FIELD

### Parameters

None

### Example

```java

    @NotInEditor
    @ListColumn
    @CellStyleGenerator(IconCellStyleGenerator.class)
    private String icon;

```




## @NotInlineEditable

### Description

Mateu MDD will create an editable grid for collection fields when it can (when all nested fields are basic or @ManyToOne fields).

Use this annotation when you want to edit collection elements in a separate window.

### Scope

FIELD

### Parameters

None

### Example

```java

    @Tab("Fares")
    @NotInlineEditable
    private List<LinearFare> fares = new ArrayList<>();

```





## @NotInList

### Description

Use it when you a want a field not to be shown in a lit view columns. 

### Scope

FIELD

### Parameters

None

### Example

```java

    @ManyToOne
    @NotInList
    private TransferPoint alternatePointForShuttle;

```




## @NotWhenCreating

### Description

Use it when you a want a field or an @Action not to be shown in an editor for new objects, so it is only shown when editing an existing object.
 

### Scope

FIELD, METHOD

### Parameters

None

### Example

```java

    @Action(order = 5, confirmationMessage = "Are you sure you want to confirm this booking?"
        , style = ValoTheme.BUTTON_FRIENDLY, icon = VaadinIcons.CHECK)
    @NotWhenCreating
    public void confirm(EntityManager em) {
        setActive(true);
    }
    
```




## @NotWhenEditing

### Description

Use it when you a want a field or an @Action not to be shown in an editor for existing objects, so it is only shown when editing a new (unsaved) object.
 

### Scope

FIELD, METHOD

### Parameters

None

### Example

```java

    @NotWhenEditing
    private boolean confirmed = true;
    
```




## @Private

### Description

Use it when you want to state some actions as private, when extending a `SimpleMDDApplication` where `isAuthenticationNeeded()` returns false.

### Scope

METHOD

### Parameters

|Name|Type|Description|
|---|---|---|
|permissions|int[]|Only users with one of these persmissions can see this menu option|
|users|String[]|Users who can see this menu option|

### Example

```java

    @Action(order = 5)
    @Private(permissions = {1})
    public AbstractAction configuracion() {
        return new MDDOpenEditorAction("", AppConfig.class, 1l);
    }

```




## @Public

### Description

Use it when you want to state some actions as public, when extending a `SimpleMDDApplication` where `isAuthenticationNeeded()` returns true.

### Scope

METHOD

### Parameters

None

### Example

```java

    @Action(order = 6)
    @Public
    public String saludar(String tuNombre) {
        return "Hola " + tuNombre;
    }

```



## @Order

### Description

Use it to state the appearance of a field inside the order part of the JPQL query used in the list view.

### Scope

FIELD

### Parameters

|Name|Type|Description|
|---|---|---|
|desc|boolean|If true the order will be descendant, otherwise ascendant|
|priority|int|In which part of the ordering clause it must appear|

### Example

```java

    @Order(desc = true, priority = 10)
    private long id;

```


## @Output

### Description

Use it to state that this field must appear as a read only value in the editor form.

### Scope

FIELD

### Parameters

None

### Example

```java

    @Embedded
    @Output
    private Audit audit = new Audit();

```

## @Password

### Description

Use it to state a field holds a password value, so characters must be shown as `*`.

### Scope

FIELD

### Parameters

None

### Example

```java

    @Password
    private String password;

```

## @Pdf

### Description

Use it to state that the annotated method result (which must be a collection of objects) must be serialized in a Pdf.

### Scope

FIELD, METHOD

### Parameters

None

### Example

```java

    @Pdf
    public static List<Person> returnsListAsReport(EntityManager em) {
        return em.createQuery("select x from " + Person.class.getName() + " x").getResultList();
    }
    
```

## @Position

### Description

Use it to state field's position inside an editor

### Scope

FIELD

### Parameters

|Name|Type|Description|
|---|---|---|
|value|int|This field's position inside the editor form|

### Example


```java

    @Position(2)
    private Integer age;

```



## @QLFilter
### Description

By default Mateu MDD will offer all instances of a class for @ManyToOne fields.

Use this annotation if you want to include any filter on the jpql used to list all options.

Please note that the referenced type will be aliased as `x``

### Scope
FIELD
### Parameters
None
### Example

```java

    @ManyToOne
    @QLFilter("x.provider = true")
    private Partner preferredProvider;

```


## @QLForCombo
### Description
By default a combo is used to view ManyToOne references. Use this annotation when you want to override the default JPQL sentence used to fill the combo. 
### Scope
TYPE
### Parameters
|Name|Type|Description|
|---|---|---|
|ql|String|The JPQL sentence|
### Example
```java

    @Entity
    @Getter
    @Setter
    @QLForCombo(ql = "select x.code, x.name.es from HotelCategory x order by x.name.es")
    public class HotelCategory {

      @Id
      private String code;

```



## @RightAlignedCol
### Description
Use it when you want a field column to be right aligned when shown in a list view.
### Scope
FIELD
### Parameters
None
### Example

```java
    
    @RightAlignedCol
    private String owner;

```


## @SameLine
### Description
By default fields are shown in a new line. Use it to override the default behaviour and sow this filed in the same line as the previous field.
### Scope
FIELD, PARAMETER
### Parameters
None
### Example

```java
    
    private String pop3Host;

    @SameLine
    private String pop3User;

    @SameLine
    private String pop3Password;

    @SameLine
    private String pop3ReboundToEmail;

```

## @SearchFilter
### Description
Use it to state that a field should be used as a search filter at the list view.
### Scope
FIELD
### Parameters
|Name|Type|Description|
|---|---|---|
|field|String|Used to state a nested field when it is an entity reference|
### Example

```java

    @NotNull
    @SearchFilter
    private String name;

```


## @Section
### Description
Used to state a new section starts with this field.

Sections are an editor's form main components.


### Scope
FIELD
### Parameters
None
### Example
```java

    @Section("Access")
    @OneToMany
    private List<Permission> permissions = new ArrayList<Permission>();

```

## Signature
### Description
Use it when you want this field to be edited by using a signature editor.
### Scope
FIELD
### Parameters

None

### Example

```java

    @Signature
    private String signature;

```


## @StartTabs
### Description
Use it to start a new tabs container inside a parent tab.
### Scope
FIELD
### Parameters
None
### Example

```java

    @StartTabs
    @FullWidth
    @Tab("General")
    private String currencyIsoCode;

```







## @Stylist
### Description

Use it whe you want to extract style related methods to another class, so you can keep you entity class clean.

The target class must extend `AbstractStylist<T>` where `T` is our model class.

### Scope
TYPE
### Parameters
|Name|Type|Description|
|---|---|---|
|value|Class|The stylist class|

### Example

```java

    @Entity
    @Getter@Setter
    @Stylist(MyStylist.class)
    public class StyledDemoEntity {
    ...
    }

```




## @SubApp
### Description
Use it to annotate a method of your app which must be presented as a submenu.
### Scope
METHOD
### Parameters
|Name|Type|Description|
|---|---|---|
|value|String|The submenu caption/label|
|icon|VaadinIcon|The submenu icon|
|order|int|The submenu position inside the menu|

### Example

```java

    @SubApp(order = 3)
    public SubMenu aSubMenu() {
        return new SubMenu();
    }
    
```


## @Sum
### Description
Use it to annotate a field which must be shown in the list view as a total sum value.
### Scope
FIELD
### Parameters
|Name|Type|Description|
|---|---|---|
|caption|String|The tab caption/label|

### Example

```java

    @Sum
    private double balance;

```


## @Tab
### Description
Use it to start a tab containing the following fields.
### Scope
FIELD
### Parameters
|Name|Type|Description|
|---|---|---|
|value|String|The tab caption/label|

### Example

```java

    @Tab("Listas")
    @FullWidth
    @ElementCollection
    private List<String> akas = new ArrayList<>();

```


## @TextArea
### Description
Use it on String fields when you want a textarea to be used instead of a simple text field.
### Scope
FIELD, PARAMETER
### Parameters
None
### Example

```java

    @TextArea
    private String xslfoForContract;

```

## @Unmodifiable
### Description
Use it on fields which can only be edited for new records, not when modifying an existing entity.
### Scope
FIELD
### Parameters
None
### Example

```java

    @Unmodifiable
    private String xxx;

```


## @UseCheckboxes
### Description
Use it to tell Mateu MDD to use checkboxes to let the user choose which instances he wants inside a collection field.
### Scope
FIELD
### Parameters
|Name|Type|Description|
|---|---|---|
|editableInline|boolean|Set to true if you want it, when edited inside a grid, to show the possible values as grid columns|

### Example

```java

    @OneToMany
    @UseCheckboxes
    private Set<TemplateUseCase> useCases = new HashSet<>();

```


## @UseChips
### Description
Use it to tell Mateu MDD to use for editing this collection.
### Scope
FIELD
### Parameters
None
### Example

```java

    @OneToMany
    @UseChips
    private List<PartnerGroup> partnerGroups = new ArrayList<>();

```

## @UseIdToSelect
### Description
For a ManyToOne relation, use an id base autocomplete field instead of a combo to select the referenced entity. It will search inside the @Id annotated field, if present.
### Scope
TYPE
### Parameters
|Name|Type|Description|
|---|---|---|
|ql|String|JPQL sentence to use, replacing xxxx by the text field content|

### Example

```java

/**
 * holder for booking. Basically a booking locator associated with a customer, under which we will
 * keep a list of booked services, charges, etc
 *
 * Created by miguel on 13/9/16.
 */
@Entity
@Getter
@Setter
@UseIdToSelect(ql = "select x.id, concat(x.leadName, ' - ', x.agency.name, ' - ', x.id) as text from Booking x where x.id = xxxx")
public class Booking implements WithTriggers {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @SearchFilter
    @Order(desc = true, priority = 10)
    private long id;

    @Embedded
    @Output
    @SearchFilter(field="created")
    @SearchFilter(field="modified")
    private Audit audit;


```




## @UseLinkToListView
### Description
Use it to tell Mateu MDD to use a separated list view to let the user choose which instances he wants inside a collection field.
### Scope
FIELD
### Parameters
|Name|Type|Description|
|---|---|---|
|listViewClass|Class|Use it if you want to use a specific list view class|
|addEnabled|boolean|Set to true if the user can create new instances from the list view|
|deleteEnabled|boolean|Set to true if the user can delete instances from the list view|
|fields|String|Comma separated list of target class fields to be shown as columns of the list view|
### Example

```java

    @OneToMany(mappedBy = "bank")
    @UseLinkToListView(addEnabled = true, fields = "name,balance")
    private List<BankAccount> accounts = new ArrayList<>();

```





## @UseRadioButtons
### Description
Use it to tell Mateu MDD to use radio buttons to let the user choose which instance he wants inside a field.
### Scope
FIELD
### Parameters
None
### Example

```java

    @UseRadioButtons
    @ManyToOne
    private CarModel model;

```



## @UseTwinCols
### Description
Use it to tell Mateu MDD to use twin cols to let the user choose which instances he wants inside a collection field.
### Scope
FIELD
### Parameters
None
### Example

```java

    @OneToMany
    @UseTwinCols
    private Set<Child> chidren = new HashSet<>();

```



## @ValueClass
### Description
In a Map or a List field, use stated class to present a combo of possible values. Target class @Id annotated field will be used to fill the value part of the map field.
### Scope
FIELD
### Parameters
|Name|Type|Description|
|---|---|---|
|value|Class|The target type|

### Example

```java

    @ElementCollection
    @ValueClass(RoomType.class)
    private List<String> habitaciones = new ArrayList<>();

```

## @ValueQL
### Description
In a Map or a List field, use stated JPQL sentence to present a combo of possible values.
### Scope
FIELD
### Parameters
|Name|Type|Description|
|---|---|---|
|value|String|The JPQL sentence to be used to fill the combo|
### Example

```java

    @ElementCollection
    @ValueQL("select x.id, x.name from RoomType x order by x.name")
    private List<String> habitaciones = new ArrayList<>();

```

## @WeekDays
### Description
Use it on a bool[] field to state that it is a week days flags container.
### Scope
FIELD
### Parameters
None
### Example

```java

    @WeekDays
    private boolean[] weekDays = {false, false, false, false, false, false, false};

```




## @Width
### Description
Use it to set the width of a field
### Scope
FIELD
### Parameters
|Name|Type|Description|
|---|---|---|
|value|String|The width of the field|

### Example

```java

    @Width("200px")
    private String icons;

```




## @Wizard
### Description
Use it on a parameter to state that a wizard should be used to fill a Data parameter.
### Scope
PARAMETER
### Parameters
|Name|Type|Description|
|---|---|---|
|value|Class|A class extending BaseServerSideWizard|

### Example

```java

    @Action(name = "Test wizard")
    public void testWizard(@Wizard(MiWizard.class) Data parametros) {
        log.debug("parametros = " + parametros);
    }

```

# Validation supported annotations

Mateu MDD adds the hibernate-validator dependency so the javax-validation api is supported.

The `@NotNull` and `@NotEmpty` annotations are specially treated by Mateu MDD as they make a required indicator visible for these fields.

# JPA supported annotations

`@ManyToOne`, `@OneToMany`, `@ManyToMany` relationships are handled in an special way by Mateu MDD.

`@ManyToOne` fields are shown as a combobox.

`@OneToMany` fields are shown as a grid.

`@ManyToMany` fields are shown as a grid.




***

Continue with the manual at [supported properties list](Supported-properties-list).