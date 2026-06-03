-- CPF/CNPJ para cobrança Asaas (Pix e fatura de cartão)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "cpfCnpj" TEXT;
