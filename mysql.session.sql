-- SELECT * from DADN.device

-- DELETE FROM DADN.device WHERE id = 1

-- INSERT INTO DADN.device (id, name,type, status,brand,feedName,feed) 
-- VALUES (1,"LED đơn 2 màu", "output","đang hoạt động","ChipFC","LED","bk-iot-led")

-- SELECT AVG(record),day(datetime) FROM DADN.humidity WHERE datetime >= str_to_date('5 26 2021','%m %d %Y') AND datetime <= str_to_date('6 03 2021','%m %d %Y')  GROUP BY day(datetime ) 

-- CREATE TABLE humidity (
--   inputId int(12) NOT NULL,
--   record int(4) NOT NULL,
--   datetime timestamp NOT NULL DEFAULT current_timestamp()
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -- SELECT * FROM humidity
-- DROP TABLE DADN.users

