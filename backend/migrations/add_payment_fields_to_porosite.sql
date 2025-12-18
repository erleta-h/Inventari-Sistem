-- Migration: Shto fusha parapagesa dhe shuma_paguar në tabelën porosite
-- Ekzekuto këtë skript në databazë

-- Shto kolonën parapagesa nëse nuk ekziston
ALTER TABLE porosite 
ADD COLUMN parapagesa DECIMAL(10, 2) DEFAULT 0;

-- Shto kolonën shuma_paguar nëse nuk ekziston
ALTER TABLE porosite 
ADD COLUMN shuma_paguar DECIMAL(10, 2) DEFAULT 0;

-- Përditëso shuma_paguar për porositë ekzistuese që kanë parapagesa
UPDATE porosite
SET shuma_paguar = COALESCE(parapagesa, 0)
WHERE shuma_paguar IS NULL OR shuma_paguar = 0;

