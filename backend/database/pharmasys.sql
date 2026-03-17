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
  photo       LONGTEXT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email, password, role) VALUES
('Pharmacist', 'admin@pharma.com', '$2y$10$kIKsEz3pfyHQp1F1FarAXeTVYs9MUsY6jClX7YlmMuObChT6cgbWq', 'pharmacist');

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
('QuickMed Wholesale', '+254 755 888 999', 'sales@quickmed.co.ke', 'Thika Road Mall, Nairobi', 'Active'),
('Cosmos Pharmaceuticals', '+254 720 111 222', 'cosmos@pharma.co.ke', 'Upper Hill, Nairobi', 'Active'),
('Beta Healthcare', '+254 731 333 444', 'beta@healthcare.co.ke', 'Westlands, Nairobi', 'Active'),
('Dawa Limited', '+254 742 555 666', 'orders@dawalimited.co.ke', 'Industrial Area, Nairobi', 'Active'),
('Regal Pharmaceuticals', '+254 753 777 888', 'regal@pharma.co.ke', 'Mombasa Road, Nairobi', 'Active'),
('Elys Chemical Industries', '+254 764 999 000', 'elys@chemical.co.ke', 'Thika, Kiambu', 'Active');

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
('Ibuprofen 400mg', 'Analgesics', 1, 7.50, 150, 30, '2027-11-20'),
('Amoxicillin 250mg', 'Antibiotics', 1, 9.00, 300, 50, '2027-08-20'),
('Azithromycin 500mg', 'Antibiotics', 2, 45.00, 120, 30, '2027-05-15'),
('Doxycycline 100mg', 'Antibiotics', 3, 18.00, 200, 40, '2027-09-10'),
('Metronidazole 400mg', 'Antibiotics', 1, 12.00, 180, 30, '2027-07-25'),
('Flucloxacillin 500mg', 'Antibiotics', 4, 22.00, 90, 20, '2027-06-30'),
('Diclofenac 50mg', 'Analgesics', 2, 9.00, 250, 40, '2027-11-15'),
('Tramadol 50mg', 'Analgesics', 5, 35.00, 80, 20, '2027-04-20'),
('Aspirin 75mg', 'Analgesics', 3, 4.50, 400, 60, '2028-02-28'),
('Codeine 30mg', 'Analgesics', 1, 28.00, 60, 15, '2027-03-30'),
('Morphine 10mg', 'Analgesics', 4, 85.00, 30, 10, '2027-01-15'),
('Glibenclamide 5mg', 'Antidiabetics', 2, 6.50, 200, 40, '2027-08-10'),
('Insulin Regular 100IU', 'Antidiabetics', 5, 450.00, 40, 10, '2026-12-31'),
('Sitagliptin 100mg', 'Antidiabetics', 3, 120.00, 50, 15, '2027-10-20'),
('Lisinopril 10mg', 'Antihypertensives', 1, 18.00, 160, 30, '2027-09-25'),
('Atenolol 50mg', 'Antihypertensives', 4, 12.00, 220, 40, '2027-07-15'),
('Losartan 50mg', 'Antihypertensives', 2, 25.00, 130, 25, '2027-11-30'),
('Hydrochlorothiazide 25mg', 'Antihypertensives', 3, 8.00, 180, 35, '2027-08-20'),
('Ranitidine 150mg', 'Gastrointestinal', 5, 14.00, 200, 40, '2027-06-15'),
('Metoclopramide 10mg', 'Gastrointestinal', 1, 10.00, 150, 30, '2027-05-20'),
('Lactulose Solution', 'Gastrointestinal', 2, 85.00, 60, 15, '2026-11-30'),
('Zinc Sulphate 20mg', 'Vitamins', 4, 6.00, 350, 60, '2028-03-15'),
('Vitamin B Complex', 'Vitamins', 3, 12.00, 280, 50, '2028-01-20'),
('Folic Acid 5mg', 'Vitamins', 5, 5.00, 400, 70, '2028-04-30'),
('Ferrous Sulphate 200mg', 'Vitamins', 1, 7.50, 320, 60, '2027-12-15'),
('Salbutamol Syrup 2mg', 'Respiratory', 2, 45.00, 70, 20, '2027-04-10'),
('Beclomethasone Inhaler', 'Respiratory', 4, 180.00, 35, 10, '2027-08-25'),
('Theophylline 200mg', 'Respiratory', 3, 22.00, 90, 20, '2027-06-20'),
('ORS Sachet', 'Gastrointestinal', 5, 8.00, 500, 100, '2028-06-30'),
('Chloroquine 250mg', 'Other', 1, 15.00, 120, 25, '2027-09-15'),
('Artemether 20mg', 'Other', 2, 65.00, 80, 20, '2027-07-10');

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

INSERT INTO patients (patient_no, name, gender, dob, phone, blood_type, conditions, allergies) VALUES
('PT-001', 'Mary Wanjiku', 'Female', '1985-04-12', '+254 712 345 678', 'O+', 'Diabetes Type 2', 'None'),
('PT-002', 'James Kariuki', 'Male', '1970-08-22', '+254 722 456 789', 'A+', 'Hypertension', 'None'),
('PT-003', 'Grace Muthoni', 'Female', '1992-11-05', '+254 733 567 890', 'B+', 'Asthma', 'None'),
('PT-004', 'Peter Odhiambo', 'Male', '1988-03-18', '+254 700 678 901', 'AB+', 'None', 'None'),
('PT-005', 'Alice Njeri', 'Female', '1990-06-15', '+254 701 234 567', 'A+', 'Hypertension', 'None'),
('PT-006', 'Samuel Mutua', 'Male', '1975-09-22', '+254 712 345 679', 'B+', 'Diabetes Type 2, Hypertension', 'Penicillin'),
('PT-007', 'Fatuma Hassan', 'Female', '1988-03-10', '+254 723 456 789', 'O-', 'Asthma', 'Aspirin'),
('PT-008', 'David Kamau', 'Male', '1965-11-30', '+254 734 567 890', 'AB+', 'Heart Disease', 'Sulfa drugs'),
('PT-009', 'Ruth Wambui', 'Female', '1995-07-18', '+254 745 678 901', 'O+', 'None', 'None'),
('PT-010', 'Joseph Otieno', 'Male', '1980-04-25', '+254 756 789 012', 'A-', 'Epilepsy', 'None'),
('PT-011', 'Esther Mwangi', 'Female', '1972-12-08', '+254 767 890 123', 'B-', 'Arthritis', 'Ibuprofen'),
('PT-012', 'Michael Kipchoge', 'Male', '1998-02-14', '+254 778 901 234', 'AB-', 'None', 'None'),
('PT-013', 'Alice Njeri', 'Female', '1990-06-15', '+254 701 234 568', 'A+', 'Hypertension', 'None'),
('PT-014', 'Samuel Mutua', 'Male', '1975-09-22', '+254 712 345 680', 'B+', 'Diabetes Type 2, Hypertension', 'Penicillin'),
('PT-015', 'Fatuma Hassan', 'Female', '1988-03-10', '+254 723 456 790', 'O-', 'Asthma', 'Aspirin'),
('PT-016', 'David Kamau', 'Male', '1965-11-30', '+254 734 567 891', 'AB+', 'Heart Disease', 'Sulfa drugs'),
('PT-017', 'Ruth Wambui', 'Female', '1995-07-18', '+254 745 678 902', 'O+', 'None', 'None'),
('PT-018', 'Joseph Otieno', 'Male', '1980-04-25', '+254 756 789 013', 'A-', 'Epilepsy', 'None'),
('PT-019', 'Esther Mwangi', 'Female', '1972-12-08', '+254 767 890 124', 'B-', 'Arthritis', 'Ibuprofen'),
('PT-020', 'Michael Kipchoge', 'Male', '1998-02-14', '+254 778 901 235', 'AB-', 'None', 'None');

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

-- ── STOCK LOG ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stock_log (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  medicine_id     INT,
  medicine_name   VARCHAR(200),
  change_type     ENUM('sale','restock','adjustment'),
  quantity_change INT,
  stock_before    INT,
  stock_after     INT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── TRIGGERS ───────────────────────────────────────────────
DELIMITER $$

CREATE TRIGGER before_sale_item_insert
BEFORE INSERT ON sale_items
FOR EACH ROW
BEGIN
  DECLARE current_stock INT;
  SELECT stock INTO current_stock FROM medicines WHERE id = NEW.medicine_id;
  IF current_stock < NEW.quantity THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient stock for this medicine.';
  END IF;
END$$

CREATE TRIGGER after_medicine_stock_update
AFTER UPDATE ON medicines
FOR EACH ROW
BEGIN
  IF OLD.stock != NEW.stock THEN
    INSERT INTO stock_log (medicine_id, medicine_name, change_type, quantity_change, stock_before, stock_after)
    VALUES (NEW.id, NEW.name,
      CASE WHEN NEW.stock < OLD.stock THEN 'sale' ELSE 'restock' END,
      NEW.stock - OLD.stock, OLD.stock, NEW.stock);
  END IF;
END$$

DELIMITER ;