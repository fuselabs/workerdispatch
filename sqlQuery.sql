create table users (
  id serial primary key,
  email varchar(255) not null,
  crypted_password varchar(255) not null,
  phone varchar(255),
  first_name varchar(255),
  last_name varchar(255),
  languages varchar(255),
  profile_picture varchar(255),
  time_registered timestamptz default now(),
  token varchar(255),
  updated_at timestamptz default now()
);

create table homes (
  id serial primary key,
  customer_id integer references users (id),
  address varchar(255)
);

create table rooms (
  id serial primary key,
  home_id integer references homes (id),
  room_type varchar(40),
  room_count integer
);

create table jobs (
  id serial primary key,
  customer_id integer references users (id),
  home_id integer references homes (id),
  worker_id integer references users (id),
  time_created timestamptz default now(),
  time_started timestamptz,
  time_needed timestamptz,
  time_finished timestamptz,
  payment_type varchar(40)
);

create table avialable_times (
  id serial primary key,
  job_id integer references jobs (id),
  time_start timestamptz
);
