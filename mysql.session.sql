-- SELECT * from DADN.device

-- DELETE FROM DADN.device WHERE id = 1

-- INSERT INTO DADN.device (id, name,type, status,brand,feedName,feed) 
-- VALUES (1,"LED đơn 2 màu", "output","đang hoạt động","ChipFC","LED","bk-iot-led")

SELECT AVG(record),day(datetime) FROM DADN.temperature GROUP BY day(datetime)
