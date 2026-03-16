-- ============================================================
--  PharmaSys Database Schema
--  Run this in phpMyAdmin or MySQL CLI
-- ============================================================

CREATE DATABASE IF NOT EXISTS pharmasys CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pharmasys;

-- ── USERS ──────────────────────────────────────────────────
CREATE TABLE users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  role        ENUM('pharmacist','admin') DEFAULT 'pharmacist',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Default user: password is "password123"
INSERT INTO users (name, email, password, role) VALUES
('Pharmacist', 'admin@pharma.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pharmacist');

-- ── SUPPLIERS ──────────────────────────────────────────────
CREATE TABLE suppliers (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  phone       VARCHAR(30),
  email       VARCHAR(150),
  address     TEXT,
  status      ENUM('Active','Inactive') DEFAULT 'Active',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO suppliers (name, phone, email, address, status) VALUES
('MedPlus Distributors', '+254 700 123 456', 'orders@medplus.co.ke', 'Nairobi Industrial Area, Lusaka Rd', 'Active'),
('PharmaLink Kenya', '+254 722 987 654', 'supply@pharmalink.co.ke', 'Mombasa Rd, Nairobi', 'Active'),
('HealthFirst Supplies', '+254 733 456 789', 'info@healthfirst.co.ke', 'Westlands, Nairobi', 'Inactive'),
('Afya Bora Medical', '+254 711 222 333', 'afyabora@gmail.com', 'Kisumu, Nyanza', 'Active'),
('QuickMed Wholesale', '+254 755 888 999', 'sales@quickmed.co.ke', 'Thika Road Mall, Nairobi', 'Active');

-- ── MEDICINES ──────────────────────────────────────────────
CREATE TABLE medicines (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(200) NOT NULL,
  category      VARCHAR(100),
  supplier_id   INT,
  price         DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock         INT NOT NULL DEFAULT 0,
  min_stock     INT DEFAULT 20,
  expiry_date   DATE,
  description   TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);

INSERT INTO medicines (name, category, supplier_id, price, stock, min_stock, expiry_date) VALUES
('Amoxicillin 500mg', 'Antibiotics', 1, 12.50, 240, 30, '2027-06-30'),
('Metformin 850mg', 'Antidiabetics', 2, 8.00, 12, 30, '2027-03-15'),
('Paracetamol 500mg', 'Analgesics', 1, 3.50, 580, 50, '2028-01-20'),
('Amlodipine 5mg', 'Antihypertensives', 3, 15.00, 28, 30, '2027-09-10'),
('Omeprazole 20mg', 'Gastrointestinal', 4, 18.00, 35, 25, '2026-12-31'),
('Ciprofloxacin 250mg', 'Antibiotics', 2, 22.00, 200, 30, '2027-08-15'),
('Amoxicillin Syrup 250mg', 'Antibiotics', 1, 35.00, 48, 20, '2026-03-10'),
('Vitamin C 500mg', 'Vitamins', 5, 5.00, 320, 50, '2028-06-30'),
('Salbutamol Inhaler', 'Respiratory', 4, 120.00, 0, 10, '2026-02-28'),
('Ibuprofen 400mg', 'Analgesics', 1, 7.50, 150, 30, '2027-11-20');

-- ── PATIENTS ───────────────────────────────────────────────
CREATE TABLE patients (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  patient_no    VARCHAR(20) UNIQUE,
  name          VARCHAR(150) NOT NULL,
  gender        ENUM('Male','Female','Other'),
  dob           DATE,
  phone         VARCHAR(30),
  email         VARCHAR(150),
  blood_type    VARCHAR(5),
  conditions    TEXT,
  allergies     TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO patients (patient_no, name, gender, dob, phone, blood_type, conditions) VALUES
('PT-001', 'Mary Wanjiku', 'Female', '1985-04-12', '+254 712 345 678', 'O+', 'Diabetes Type 2'),
('PT-002', 'James Kariuki', 'Male', '1970-08-22', '+254 722 456 789', 'A+', 'Hypertension'),
('PT-003', 'Grace Muthoni', 'Female', '1992-11-05', '+254 733 567 890', 'B+', 'Asthma'),
('PT-004', 'Peter Odhiambo', 'Male', '1988-03-18', '+254 700 678 901', 'AB+', 'None');

-- ── PRESCRIPTIONS ──────────────────────────────────────────
CREATE TABLE prescriptions (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  rx_number     VARCHAR(20) UNIQUE,
  patient_id    INT,
  doctor_name   VARCHAR(150),
  status        ENUM('Pending','Fulfilled','Partial','Cancelled') DEFAULT 'Pending',
  notes         TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL
);

CREATE TABLE prescription_items (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  prescription_id   INT NOT NULL,
  medicine_id       INT,
  medicine_name     VARCHAR(200),
  quantity          INT NOT NULL,
  dosage            VARCHAR(100),
  FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE,
  FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE SET NULL
);

-- ── SALES ──────────────────────────────────────────────────
CREATE TABLE sales (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  sale_number     VARCHAR(20) UNIQUE,
  customer_name   VARCHAR(150) DEFAULT 'Walk-in Customer',
  subtotal        DECIMAL(10,2),
  tax             DECIMAL(10,2),
  total           DECIMAL(10,2),
  payment_method  ENUM('Cash','M-Pesa','Card') DEFAULT 'Cash',
  cashier_id      INT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cashier_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE sale_items (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  sale_id       INT NOT NULL,
  medicine_id   INT,
  medicine_name VARCHAR(200),
  quantity      INT NOT NULL,
  unit_price    DECIMAL(10,2),
  total_price   DECIMAL(10,2),
  FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
  FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE SET NULL
);
