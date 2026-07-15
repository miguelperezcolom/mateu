-- Front-Office Suite persistence schema (H2).
-- One aggregate = one table tree, per Spring Data JDBC conventions.

-- ── Guest aggregate ──────────────────────────────────────────────────────────
create table guest (
    id                varchar(64)  primary key,
    name              varchar(200) not null,
    document          varchar(50),
    document_verified boolean      not null,
    email             varchar(200),
    phone             varchar(50),
    tier              varchar(20)  not null,
    loyalty_points    int          not null,
    stays             int          not null,
    nights            int          not null,
    years_as_client   int          not null,
    complaints        int          not null,
    hotels            int          not null,
    last_stay_summary varchar(300),
    last_stay_complementary_info varchar(300)
);

create table guest_preference (
    guest_id varchar(64)  not null references guest (id),
    idx      int          not null,
    text     varchar(200) not null,
    primary key (guest_id, idx)
);

-- ── Stay aggregate ───────────────────────────────────────────────────────────
create table stay (
    id             varchar(64)  primary key,
    guest_id       varchar(64)  not null references guest (id),
    room_number    varchar(10),
    room_type      varchar(100),
    board          varchar(100),
    check_in       date         not null,
    check_out      date         not null,
    pax            int          not null,
    agency         varchar(200),
    total          decimal(12, 2),
    status         varchar(20)  not null,
    wishes_granted int          not null,
    wishes_total   int          not null,
    vip_note       varchar(200)
);

create table stay_companion (
    stay_id      varchar(64)  not null references stay (id),
    idx          int          not null,
    companion_id varchar(64)  not null,
    name         varchar(200) not null,
    description  varchar(300),
    primary key (stay_id, idx)
);

create table stay_incident (
    stay_id     varchar(64)  not null references stay (id),
    idx         int          not null,
    code        varchar(64)  not null,
    icon        varchar(10),
    title       varchar(200) not null,
    description varchar(400),
    status      varchar(20)  not null,
    complaint   boolean      not null,
    primary key (stay_id, idx)
);

create table stay_add_on (
    stay_id   varchar(64) not null references stay (id),
    add_on_id varchar(64) not null,
    primary key (stay_id, add_on_id)
);

-- ── Folio aggregate ──────────────────────────────────────────────────────────
create table folio (
    id            varchar(64) primary key,
    stay_id       varchar(64) not null references stay (id),
    preauthorized decimal(12, 2)
);

create table folio_line (
    folio_id       varchar(64)  not null references folio (id),
    idx            int          not null,
    concept        varchar(200) not null,
    amount         decimal(12, 2),
    included       boolean      not null,
    included_label varchar(50),
    primary key (folio_id, idx)
);

-- ── Room aggregate ───────────────────────────────────────────────────────────
create table room (
    room_number      varchar(10)  primary key,
    floor            int          not null,
    type             varchar(100),
    occupancy        varchar(20)  not null,
    housekeeping     varchar(20)  not null,
    maintenance_note varchar(200)
);

-- ── Automation aggregate ─────────────────────────────────────────────────────
create table automation (
    id            varchar(64)  primary key,
    name          varchar(200) not null,
    ok_count      int          not null,
    warning_count int          not null,
    error_count   int          not null
);

create table automation_system (
    automation_id varchar(64)  not null references automation (id),
    idx           int          not null,
    name          varchar(100) not null,
    primary key (automation_id, idx)
);

-- ── Reference data: charge & add-on catalogs ─────────────────────────────────
create table charge_catalog_item (
    code  varchar(20)  primary key,
    name  varchar(200) not null,
    price decimal(12, 2)
);

create table add_on_catalog_item (
    id             varchar(64)  primary key,
    icon           varchar(10),
    title          varchar(200) not null,
    description    varchar(300),
    price          decimal(12, 2),
    unit           varchar(50),
    included_label varchar(100)
);
