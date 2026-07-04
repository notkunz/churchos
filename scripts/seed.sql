-- Seed test data for development
insert into churches (name, pastor_name, email)
values ('Grace Chapel', 'Pastor John', 'test@church.com');

insert into members (church_id, full_name, phone, department, join_date)
values
  ((select id from churches where email = 'test@church.com'), 'Adebayo Johnson', '08012345678', 'Choir', '2023-01-15'),
  ((select id from churches where email = 'test@church.com'), 'Ngozi Okafor', '08087654321', 'Ushering', '2023-03-20'),
  ((select id from churches where email = 'test@church.com'), 'Emeka Chukwu', '08055555555', 'Media', '2024-01-01');