import re

with open('/Users/bhuvan/Documents/Bhuvan/Products/Sewvee-Backend-API/src/Mobile/order/order.service.ts', 'r') as f:
    content = f.read()

old_sql = """      SELECT 
        o.id as order_id, 
        o.order_number as order_name,
        o.order_type,"""

new_sql = """      SELECT 
        o.id as order_id, 
        COALESCE(
          (SELECT order_number FROM orders o2 WHERE o2.id = NULLIF(SUBSTRING(o.order_notes FROM '^CONVERTED_TO_([0-9]+)'), '')::integer),
          o.order_number
        ) as order_name,
        COALESCE(
          (SELECT order_type FROM orders o2 WHERE o2.id = NULLIF(SUBSTRING(o.order_notes FROM '^CONVERTED_TO_([0-9]+)'), '')::integer),
          o.order_type
        ) as order_type,"""

content = content.replace(old_sql, new_sql)

with open('/Users/bhuvan/Documents/Bhuvan/Products/Sewvee-Backend-API/src/Mobile/order/order.service.ts', 'w') as f:
    f.write(content)
