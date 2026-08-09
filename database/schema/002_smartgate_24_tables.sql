-- ============================================================
-- GTM Smart Gate — 24 Core PostgreSQL Database Schema
-- Matches the backend API_masters & 24 table specification
-- ============================================================

CREATE SCHEMA IF NOT EXISTS smartgate;
SET search_path TO smartgate, public;

-- 1. company_details
CREATE TABLE IF NOT EXISTS company_details (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  company_code VARCHAR(255),
  company_name VARCHAR(255),
  registration_no VARCHAR(255),
  address1 VARCHAR(255),
  address2 VARCHAR(255),
  city VARCHAR(255),
  state VARCHAR(255),
  pincode INTEGER,
  contact_person VARCHAR(255),
  contact_mobno VARCHAR(255),
  contact_email VARCHAR(255),
  landline VARCHAR(255),
  site_count INTEGER DEFAULT 0,
  user_count INTEGER DEFAULT 0,
  logo TEXT,
  logo_type TEXT,
  logo_path TEXT,
  is_deleted BOOLEAN DEFAULT false,
  welcome_msg VARCHAR(100),
  comp_type VARCHAR(50)
);

-- 2. sites
CREATE TABLE IF NOT EXISTS sites (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  site_code VARCHAR(255),
  site_name VARCHAR(255),
  address1 VARCHAR(255),
  address2 VARCHAR(255),
  city VARCHAR(255),
  state VARCHAR(255),
  pincode INTEGER,
  comp_id BIGINT REFERENCES company_details(id),
  is_deleted BOOLEAN DEFAULT false
);

-- 3. store_details
CREATE TABLE IF NOT EXISTS store_details (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  site_code VARCHAR(255),
  site_name VARCHAR(255),
  address1 VARCHAR(255),
  address2 VARCHAR(255),
  city VARCHAR(255),
  state VARCHAR(255),
  contact_person VARCHAR(255),
  landline VARCHAR(50),
  contact_mobno VARCHAR(255),
  contact_email VARCHAR(255),
  pincode INTEGER,
  comp_id BIGINT REFERENCES company_details(id),
  gstno VARCHAR(255),
  is_deleted BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true
);

-- 4. roleinfos
CREATE TABLE IF NOT EXISTS roleinfos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code VARCHAR(255),
  name VARCHAR(255),
  is_deleted BOOLEAN DEFAULT false
);

-- 5. passcategory_details
CREATE TABLE IF NOT EXISTS passcategory_details (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  category VARCHAR(100),
  start_time TIMESTAMP WITHOUT TIME ZONE,
  status VARCHAR(255)
);

-- 6. pass_details
CREATE TABLE IF NOT EXISTS pass_details (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pass_code VARCHAR(50),
  pass_desc VARCHAR(50),
  passcategory_id BIGINT REFERENCES passcategory_details(id),
  info1 VARCHAR(50),
  info2 VARCHAR(50),
  active BOOLEAN DEFAULT true,
  site_id BIGINT REFERENCES sites(id),
  comp_id BIGINT REFERENCES company_details(id)
);

-- 7. users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(150) UNIQUE,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- 8. auto_prefixs
CREATE TABLE IF NOT EXISTS auto_prefixs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  site_prefix VARCHAR(255),
  user_prefix VARCHAR(255),
  emp_prefix VARCHAR(50),
  comp_id BIGINT REFERENCES company_details(id),
  is_deleted BOOLEAN DEFAULT false
);

-- 9. employee_details
CREATE TABLE IF NOT EXISTS employee_details (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  employee_code VARCHAR(50),
  employee_name VARCHAR(100),
  email VARCHAR(255),
  mobile_no VARCHAR(50),
  designation VARCHAR(50),
  department VARCHAR(50),
  active BOOLEAN DEFAULT true,
  vehicle BOOLEAN DEFAULT false,
  vehicle_type VARCHAR(200),
  vehicle_no VARCHAR(200),
  status VARCHAR(255) DEFAULT 'Active',
  site_id BIGINT REFERENCES sites(id),
  comp_id BIGINT REFERENCES company_details(id),
  it_alert BOOLEAN DEFAULT false,
  admin_alert BOOLEAN DEFAULT false
);

-- 10. user_details
CREATE TABLE IF NOT EXISTS user_details (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_code VARCHAR(50),
  user_name VARCHAR(255),
  password VARCHAR(255),
  email VARCHAR(255),
  mobile_no VARCHAR(50),
  role_id BIGINT REFERENCES roleinfos(id),
  active BOOLEAN DEFAULT true,
  site_id BIGINT REFERENCES sites(id),
  comp_id BIGINT REFERENCES company_details(id),
  pass_id BIGINT REFERENCES pass_details(id),
  checkin_date TIMESTAMP WITHOUT TIME ZONE,
  checkout_date TIMESTAMP WITHOUT TIME ZONE,
  status VARCHAR(50)
);

-- 11. conference_details
CREATE TABLE IF NOT EXISTS conference_details (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name_of_resource VARCHAR(255),
  department_req VARCHAR(255),
  emp_id BIGINT,
  type_of_meeting VARCHAR(255),
  external_vendor_name VARCHAR(255),
  comp_id BIGINT REFERENCES company_details(id),
  site_id BIGINT REFERENCES sites(id),
  booking_code VARCHAR(255),
  user_code VARCHAR(255),
  reason VARCHAR(255),
  end_time TIMESTAMP WITHOUT TIME ZONE,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT false
);

-- 12. emp_bookingdetails
CREATE TABLE IF NOT EXISTS emp_bookingdetails (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  emp_code VARCHAR(255),
  visitor_name VARCHAR(255),
  coming_from VARCHAR(255),
  person_to_meet VARCHAR(255),
  no_of_person INTEGER,
  visitors_type VARCHAR(255),
  mobile_no VARCHAR(255),
  email VARCHAR(255),
  booking_date DATE,
  site_id BIGINT REFERENCES sites(id),
  comp_id BIGINT REFERENCES company_details(id)
);

-- 13. permanent_employee
CREATE TABLE IF NOT EXISTS permanent_employee (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  visitor_name VARCHAR(100),
  mobile_no VARCHAR(50),
  coming_from VARCHAR(50),
  person_to_meet VARCHAR(100),
  visitors_type VARCHAR(50),
  image_type VARCHAR(50),
  image_path TEXT,
  image_name VARCHAR(50),
  idproof_type VARCHAR(50),
  idproof_path TEXT,
  idproof_name VARCHAR(50),
  laptop INTEGER DEFAULT 0,
  model VARCHAR(100),
  serial_no VARCHAR(100),
  vehicle_type VARCHAR(100),
  vehicle_no VARCHAR(100)
);

-- 14. resource_masters
CREATE TABLE IF NOT EXISTS resource_masters (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  room_name VARCHAR(50),
  room_code VARCHAR(255),
  capacity INTEGER,
  projector_available BOOLEAN DEFAULT false,
  comp_id BIGINT REFERENCES company_details(id),
  site_id BIGINT REFERENCES sites(id)
);

-- 15. gate_privileges
CREATE TABLE IF NOT EXISTS gate_privileges (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code VARCHAR(100)
);

-- 16. conf_other_service_details
CREATE TABLE IF NOT EXISTS conf_other_service_details (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  services VARCHAR(255),
  service_time TIMESTAMP WITHOUT TIME ZONE,
  no_of_count INTEGER,
  booking_code VARCHAR(255),
  comp_id BIGINT REFERENCES company_details(id),
  site_id BIGINT REFERENCES sites(id),
  is_deleted BOOLEAN DEFAULT false
);

-- 17. emp_vehicledetails
CREATE TABLE IF NOT EXISTS emp_vehicledetails (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  emp_id BIGINT,
  checkin_date TIMESTAMP WITHOUT TIME ZONE,
  checkout_date TIMESTAMP WITHOUT TIME ZONE,
  site_id BIGINT REFERENCES sites(id),
  comp_id BIGINT REFERENCES company_details(id)
);

-- 18. vehicle_entry
CREATE TABLE IF NOT EXISTS vehicle_entry (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  vehicle_type VARCHAR(255),
  vehicle_number VARCHAR(255),
  entry_date DATE,
  entry_time TIMESTAMP WITHOUT TIME ZONE,
  driver_name VARCHAR(255),
  no_of_pass VARCHAR(255),
  status VARCHAR(255),
  comp_id BIGINT REFERENCES company_details(id),
  site_id BIGINT REFERENCES sites(id),
  img_vehicle TEXT,
  user_code VARCHAR(255),
  vehicle_in_date TIMESTAMP WITHOUT TIME ZONE
);

-- 19. vehicle_master
CREATE TABLE IF NOT EXISTS vehicle_master (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  vehicle_no VARCHAR(255),
  vehicle_type VARCHAR(255),
  vehicle_model VARCHAR(255),
  no_of_seat INTEGER,
  rc_no VARCHAR(255),
  insurance_date TIMESTAMP WITHOUT TIME ZONE,
  driver_name VARCHAR(255),
  driver_con_number VARCHAR(255),
  owner_name VARCHAR(255),
  owner_con_number VARCHAR(255),
  email VARCHAR(255),
  comp_id BIGINT REFERENCES company_details(id),
  site_id BIGINT REFERENCES sites(id)
);

-- 20. visitor_masters
CREATE TABLE IF NOT EXISTS visitor_masters (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  visitor_code VARCHAR(100),
  visitor_desc VARCHAR(100),
  time_count INTEGER,
  hrs_count VARCHAR(255),
  active BOOLEAN DEFAULT true,
  site_id BIGINT REFERENCES sites(id),
  comp_id BIGINT REFERENCES company_details(id)
);

-- 21. multicompany_details
CREATE TABLE IF NOT EXISTS multicompany_details (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  mulcomp_code VARCHAR(100),
  mulcomp_name VARCHAR(100),
  level VARCHAR(100),
  mobile_no VARCHAR(50),
  active BOOLEAN DEFAULT true,
  site_id BIGINT REFERENCES sites(id),
  comp_id BIGINT REFERENCES company_details(id)
);

-- 22. gateuser_details
CREATE TABLE IF NOT EXISTS gateuser_details (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT REFERENCES user_details(id),
  privileges_id BIGINT REFERENCES gate_privileges(id),
  site_id BIGINT REFERENCES sites(id),
  comp_id BIGINT REFERENCES company_details(id)
);

-- 23. visitor_details
CREATE TABLE IF NOT EXISTS visitor_details (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  mobile_no VARCHAR(50),
  otp INTEGER,
  visitor_name VARCHAR(100),
  coming_from VARCHAR(100),
  person_to_meet VARCHAR(100),
  visitors_type VARCHAR(50),
  image_type VARCHAR(50),
  image_path TEXT,
  image_name VARCHAR(50),
  idproof_type VARCHAR(50),
  idproof_path TEXT,
  idproof_name VARCHAR(100),
  laptop INTEGER DEFAULT 0,
  model VARCHAR(100),
  serial_no VARCHAR(100),
  vehicle_type VARCHAR(100),
  vehicle_no VARCHAR(100),
  pass_id BIGINT REFERENCES pass_details(id),
  checkin_date TIMESTAMP WITHOUT TIME ZONE,
  checkout_date TIMESTAMP WITHOUT TIME ZONE,
  status VARCHAR(50) DEFAULT 'Awaiting Approval',
  site_id BIGINT REFERENCES sites(id),
  comp_id BIGINT REFERENCES company_details(id),
  otp_date TIMESTAMP WITHOUT TIME ZONE,
  mulcomp_id BIGINT REFERENCES multicompany_details(id),
  empbook_id BIGINT REFERENCES emp_bookingdetails(id)
);

-- 24. visitor_trans
CREATE TABLE IF NOT EXISTS visitor_trans (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  mobile_no VARCHAR(50),
  otp INTEGER,
  visitor_name VARCHAR(100),
  coming_from VARCHAR(50),
  person_to_meet VARCHAR(100),
  visitors_type VARCHAR(50),
  guest_type INTEGER,
  image_type VARCHAR(50),
  image_path TEXT,
  image_name VARCHAR(50),
  idproof_type VARCHAR(50),
  idproof_path TEXT,
  idproof_name VARCHAR(50),
  laptop INTEGER DEFAULT 0,
  model VARCHAR(100),
  serial_no VARCHAR(100),
  vehicle_type VARCHAR(100),
  vehicle_no VARCHAR(100),
  pass_id BIGINT REFERENCES pass_details(id),
  checkin_date TIMESTAMP WITHOUT TIME ZONE,
  checkout_date TIMESTAMP WITHOUT TIME ZONE,
  status VARCHAR(50),
  site_id BIGINT REFERENCES sites(id),
  comp_id BIGINT REFERENCES company_details(id),
  otp_date TIMESTAMP WITHOUT TIME ZONE,
  mulcomp_id BIGINT REFERENCES multicompany_details(id)
);
