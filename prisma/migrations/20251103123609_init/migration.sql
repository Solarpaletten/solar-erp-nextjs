-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "CompanyUserRole" AS ENUM ('OWNER', 'ADMIN', 'MANAGER', 'EMPLOYEE', 'VIEWER');

-- CreateEnum
CREATE TYPE "ClientRole" AS ENUM ('CLIENT', 'SUPPLIER', 'BOTH');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('EUR', 'USD', 'AED', 'UAH', 'GBP');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'PARTIAL', 'DELIVERED', 'IN_TRANSIT', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SalesDocumentType" AS ENUM ('QUOTE', 'ORDER', 'INVOICE', 'DELIVERY_NOTE', 'RECEIPT');

-- CreateEnum
CREATE TYPE "PurchaseOperationType" AS ENUM ('PURCHASE', 'RETURN', 'CORRECTION', 'TRANSFER');

-- CreateEnum
CREATE TYPE "WarehouseStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "BankOperationType" AS ENUM ('INCOME', 'EXPENSE', 'TRANSFER');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(50),
    "last_name" VARCHAR(50),
    "phone" VARCHAR(20),
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "email_verified_at" TIMESTAMP(3),
    "verification_token" VARCHAR(255),
    "reset_token" VARCHAR(255),
    "reset_token_expires" TIMESTAMP(3),
    "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
    "current_company_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "short_name" VARCHAR(50),
    "description" TEXT,
    "email" VARCHAR(100),
    "phone" VARCHAR(20),
    "website" VARCHAR(200),
    "legal_entity_type" VARCHAR(50) NOT NULL,
    "registration_number" VARCHAR(50),
    "vat_number" VARCHAR(50),
    "legal_address" TEXT,
    "actual_address" TEXT,
    "tax_country" VARCHAR(3) NOT NULL DEFAULT 'UAE',
    "base_currency" "Currency" NOT NULL DEFAULT 'AED',
    "owner_id" INTEGER NOT NULL,
    "director_name" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "setup_completed" BOOLEAN NOT NULL DEFAULT false,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_users" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role" "CompanyUserRole" NOT NULL DEFAULT 'EMPLOYEE',
    "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "abbreviation" VARCHAR(100),
    "code" VARCHAR(50),
    "email" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20),
    "fax" VARCHAR(20),
    "website" VARCHAR(200),
    "contact_information" TEXT,
    "role" "ClientRole" NOT NULL DEFAULT 'CLIENT',
    "is_juridical" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_foreigner" BOOLEAN NOT NULL DEFAULT false,
    "country" VARCHAR(100),
    "legal_address" TEXT,
    "actual_address" TEXT,
    "business_license_code" VARCHAR(50),
    "vat_code" VARCHAR(50),
    "vat_rate" DECIMAL(5,2),
    "eori_code" VARCHAR(50),
    "foreign_taxpayer_code" VARCHAR(50),
    "registration_number" VARCHAR(50),
    "credit_sum" DECIMAL(15,2) DEFAULT 0,
    "pay_per" VARCHAR(50),
    "currency" "Currency" NOT NULL DEFAULT 'EUR',
    "payment_terms" VARCHAR(100),
    "automatic_debt_reminder" BOOLEAN DEFAULT false,
    "registration_date" DATE,
    "date_of_birth" DATE,
    "sabis_customer_name" VARCHAR(200),
    "sabis_customer_code" VARCHAR(50),
    "additional_information" TEXT,
    "notes" TEXT,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_addresses" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "address" VARCHAR(255),
    "city" VARCHAR(100),
    "country" VARCHAR(100) NOT NULL,
    "postcode" VARCHAR(20),
    "employee_id" INTEGER,
    "is_registration" BOOLEAN NOT NULL DEFAULT false,
    "is_correspondence" BOOLEAN NOT NULL DEFAULT false,
    "is_load" BOOLEAN NOT NULL DEFAULT false,
    "is_unload" BOOLEAN NOT NULL DEFAULT false,
    "is_department" BOOLEAN NOT NULL DEFAULT false,
    "name" VARCHAR(100),
    "description" TEXT,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_bank_accounts" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "account_number" VARCHAR(50) NOT NULL,
    "bank_name" VARCHAR(100) NOT NULL,
    "bank_code" VARCHAR(20),
    "swift_code" VARCHAR(20),
    "iban" VARCHAR(50),
    "currency" "Currency" NOT NULL DEFAULT 'EUR',
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "unit" VARCHAR(20) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "cost_price" DECIMAL(10,2),
    "currency" "Currency" NOT NULL DEFAULT 'EUR',
    "vat_rate" DECIMAL(5,2),
    "category" VARCHAR(100),
    "subcategory" VARCHAR(100),
    "min_stock" DECIMAL(10,2),
    "current_stock" DECIMAL(10,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_service" BOOLEAN NOT NULL DEFAULT false,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "document_number" VARCHAR(50) NOT NULL,
    "document_date" DATE NOT NULL,
    "document_type" "SalesDocumentType" NOT NULL DEFAULT 'INVOICE',
    "delivery_date" DATE,
    "due_date" DATE,
    "client_id" INTEGER NOT NULL,
    "warehouse_id" INTEGER,
    "sales_manager_id" INTEGER,
    "subtotal" DECIMAL(15,2) NOT NULL,
    "vat_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "discount_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(15,2) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'EUR',
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "delivery_status" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "document_status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sale_items" (
    "id" SERIAL NOT NULL,
    "sale_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "line_number" INTEGER,
    "quantity" DECIMAL(10,3) NOT NULL,
    "unit_price_base" DECIMAL(10,2) NOT NULL,
    "discount_percent" DECIMAL(5,2) DEFAULT 0,
    "total_discount" DECIMAL(15,2) DEFAULT 0,
    "vat_rate" DECIMAL(5,2),
    "vat_amount" DECIMAL(15,2),
    "line_total" DECIMAL(15,2) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sale_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchases" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "document_number" VARCHAR(50) NOT NULL,
    "document_date" DATE NOT NULL,
    "operation_type" "PurchaseOperationType" NOT NULL DEFAULT 'PURCHASE',
    "supplier_id" INTEGER NOT NULL,
    "warehouse_id" INTEGER,
    "purchase_manager_id" INTEGER,
    "subtotal" DECIMAL(15,2) NOT NULL,
    "vat_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(15,2) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'EUR',
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "delivery_status" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "document_status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_items" (
    "id" SERIAL NOT NULL,
    "purchase_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "line_number" INTEGER,
    "quantity" DECIMAL(10,3) NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "vat_rate" DECIMAL(5,2),
    "vat_amount" DECIMAL(15,2),
    "line_total" DECIMAL(15,2) NOT NULL,
    "employee_id" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouses" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(20),
    "description" TEXT,
    "address" TEXT,
    "manager_id" INTEGER,
    "status" "WarehouseStatus" NOT NULL DEFAULT 'ACTIVE',
    "is_main" BOOLEAN NOT NULL DEFAULT false,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "clientsId" INTEGER,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_operations" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "doc_number" VARCHAR(50) NOT NULL,
    "operation_date" DATE NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'EUR',
    "type" "BankOperationType" NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "client_id" INTEGER,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_operations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chart_of_accounts" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "account_code" VARCHAR(20) NOT NULL,
    "account_name" VARCHAR(255) NOT NULL,
    "account_type" VARCHAR(50) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "currency" "Currency",
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chart_of_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vat_classifications" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "vat_rate" DECIMAL(5,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "vat_classifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_centers" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "parent_id" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "cost_centers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "intrastat_codes" (
    "id" SERIAL NOT NULL,
    "code_type" VARCHAR(20) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "intrastat_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_verification_token_key" ON "users"("verification_token");

-- CreateIndex
CREATE UNIQUE INDEX "users_reset_token_key" ON "users"("reset_token");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_is_active_idx" ON "users"("is_active");

-- CreateIndex
CREATE INDEX "users_current_company_id_idx" ON "users"("current_company_id");

-- CreateIndex
CREATE UNIQUE INDEX "companies_code_key" ON "companies"("code");

-- CreateIndex
CREATE INDEX "companies_owner_id_idx" ON "companies"("owner_id");

-- CreateIndex
CREATE INDEX "companies_code_idx" ON "companies"("code");

-- CreateIndex
CREATE INDEX "companies_name_idx" ON "companies"("name");

-- CreateIndex
CREATE INDEX "companies_is_active_idx" ON "companies"("is_active");

-- CreateIndex
CREATE INDEX "companies_tax_country_idx" ON "companies"("tax_country");

-- CreateIndex
CREATE INDEX "company_users_company_id_idx" ON "company_users"("company_id");

-- CreateIndex
CREATE INDEX "company_users_user_id_idx" ON "company_users"("user_id");

-- CreateIndex
CREATE INDEX "company_users_role_idx" ON "company_users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "company_users_company_id_user_id_key" ON "company_users"("company_id", "user_id");

-- CreateIndex
CREATE INDEX "clients_company_id_idx" ON "clients"("company_id");

-- CreateIndex
CREATE INDEX "clients_role_idx" ON "clients"("role");

-- CreateIndex
CREATE INDEX "clients_is_active_idx" ON "clients"("is_active");

-- CreateIndex
CREATE INDEX "clients_country_idx" ON "clients"("country");

-- CreateIndex
CREATE INDEX "clients_created_by_idx" ON "clients"("created_by");

-- CreateIndex
CREATE UNIQUE INDEX "clients_company_id_code_key" ON "clients"("company_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "clients_company_id_vat_code_key" ON "clients"("company_id", "vat_code");

-- CreateIndex
CREATE INDEX "client_addresses_client_id_idx" ON "client_addresses"("client_id");

-- CreateIndex
CREATE INDEX "client_addresses_country_idx" ON "client_addresses"("country");

-- CreateIndex
CREATE INDEX "client_addresses_is_correspondence_idx" ON "client_addresses"("is_correspondence");

-- CreateIndex
CREATE INDEX "client_bank_accounts_client_id_idx" ON "client_bank_accounts"("client_id");

-- CreateIndex
CREATE INDEX "client_bank_accounts_is_primary_idx" ON "client_bank_accounts"("is_primary");

-- CreateIndex
CREATE UNIQUE INDEX "client_bank_accounts_client_id_account_number_key" ON "client_bank_accounts"("client_id", "account_number");

-- CreateIndex
CREATE INDEX "products_company_id_idx" ON "products"("company_id");

-- CreateIndex
CREATE INDEX "products_is_active_idx" ON "products"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "products_company_id_code_key" ON "products"("company_id", "code");

-- CreateIndex
CREATE INDEX "sales_company_id_idx" ON "sales"("company_id");

-- CreateIndex
CREATE INDEX "sales_document_date_idx" ON "sales"("document_date");

-- CreateIndex
CREATE INDEX "sales_client_id_idx" ON "sales"("client_id");

-- CreateIndex
CREATE INDEX "sales_payment_status_idx" ON "sales"("payment_status");

-- CreateIndex
CREATE UNIQUE INDEX "sales_company_id_document_number_key" ON "sales"("company_id", "document_number");

-- CreateIndex
CREATE INDEX "sale_items_sale_id_idx" ON "sale_items"("sale_id");

-- CreateIndex
CREATE INDEX "sale_items_product_id_idx" ON "sale_items"("product_id");

-- CreateIndex
CREATE INDEX "purchases_company_id_idx" ON "purchases"("company_id");

-- CreateIndex
CREATE INDEX "purchases_document_date_idx" ON "purchases"("document_date");

-- CreateIndex
CREATE INDEX "purchases_supplier_id_idx" ON "purchases"("supplier_id");

-- CreateIndex
CREATE UNIQUE INDEX "purchases_company_id_document_number_key" ON "purchases"("company_id", "document_number");

-- CreateIndex
CREATE INDEX "purchase_items_purchase_id_idx" ON "purchase_items"("purchase_id");

-- CreateIndex
CREATE INDEX "purchase_items_product_id_idx" ON "purchase_items"("product_id");

-- CreateIndex
CREATE INDEX "warehouses_company_id_idx" ON "warehouses"("company_id");

-- CreateIndex
CREATE INDEX "warehouses_status_idx" ON "warehouses"("status");

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_company_id_code_key" ON "warehouses"("company_id", "code");

-- CreateIndex
CREATE INDEX "bank_operations_company_id_idx" ON "bank_operations"("company_id");

-- CreateIndex
CREATE INDEX "bank_operations_operation_date_idx" ON "bank_operations"("operation_date");

-- CreateIndex
CREATE INDEX "bank_operations_type_idx" ON "bank_operations"("type");

-- CreateIndex
CREATE INDEX "chart_of_accounts_company_id_idx" ON "chart_of_accounts"("company_id");

-- CreateIndex
CREATE INDEX "chart_of_accounts_account_type_idx" ON "chart_of_accounts"("account_type");

-- CreateIndex
CREATE UNIQUE INDEX "chart_of_accounts_company_id_account_code_key" ON "chart_of_accounts"("company_id", "account_code");

-- CreateIndex
CREATE INDEX "vat_classifications_company_id_idx" ON "vat_classifications"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "vat_classifications_company_id_code_key" ON "vat_classifications"("company_id", "code");

-- CreateIndex
CREATE INDEX "cost_centers_company_id_idx" ON "cost_centers"("company_id");

-- CreateIndex
CREATE INDEX "cost_centers_parent_id_idx" ON "cost_centers"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "cost_centers_company_id_code_key" ON "cost_centers"("company_id", "code");

-- CreateIndex
CREATE INDEX "intrastat_codes_code_type_idx" ON "intrastat_codes"("code_type");

-- CreateIndex
CREATE UNIQUE INDEX "intrastat_codes_code_type_code_key" ON "intrastat_codes"("code_type", "code");

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_users" ADD CONSTRAINT "company_users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_users" ADD CONSTRAINT "company_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_addresses" ADD CONSTRAINT "client_addresses_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_addresses" ADD CONSTRAINT "client_addresses_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_bank_accounts" ADD CONSTRAINT "client_bank_accounts_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_sales_manager_id_fkey" FOREIGN KEY ("sales_manager_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_purchase_manager_id_fkey" FOREIGN KEY ("purchase_manager_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "purchases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_clientsId_fkey" FOREIGN KEY ("clientsId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_operations" ADD CONSTRAINT "bank_operations_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_operations" ADD CONSTRAINT "bank_operations_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_operations" ADD CONSTRAINT "bank_operations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chart_of_accounts" ADD CONSTRAINT "chart_of_accounts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chart_of_accounts" ADD CONSTRAINT "chart_of_accounts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vat_classifications" ADD CONSTRAINT "vat_classifications_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "cost_centers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
