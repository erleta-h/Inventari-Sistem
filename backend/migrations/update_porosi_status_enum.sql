-- Përditëso ENUM-in për kolonën status në tabelën porosite
-- Shto vlerat e reja: READY_FOR_SHIPPING, DELIVERED, CANCELLED, FAILED

ALTER TABLE porosite 
MODIFY COLUMN status ENUM(
  'DRAFT',
  'CONFIRMED',
  'PREPARING',
  'READY_FOR_SHIPPING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'FAILED'
) NOT NULL DEFAULT 'DRAFT';



