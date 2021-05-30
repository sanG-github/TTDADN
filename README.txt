------------------------------------
Project: Smart Tomatoes Garden
------------------------------------


----------- Adafruit IoT server --------------------------------

GET: '/getAllFeed': Nhận tất cả các feed từ Adafruit IoT server.


----------- Database --------------------------------
GET: '/device':                 Nhận danh sách các thiết bị có trong vườn được lưu ở Database
GET: '/temperature':            Nhận danh sách các bản ghi dữ liệu về nhiệt dộ được lưu ở Database
GET: '/light':                  Nhận danh sách các bản ghi dữ liệu về cường độ ánh sáng được lưu ở Database
GET: '/moisture':               Nhận danh sách các bản ghi dữ liệu về độ ẩm đất được lưu ở Database
GET: '/constrain':              Nhận danh sách các ràng buộc thông số được lưu ở Database
GET: '/constrain?type=[type]':  Nhận ràng buộc thông số được chỉ định được lưu ở Database với [type] : loại thông số muốn lấy ràng buộc (temperature, light, moisture)

POST: '/addConstrain'           Thêm 1 ràng buộc thông số vào database.
POST: '/setConstrain'           Thêm 1 ràng buộc thông số vào database.


---------- socketIo --------------------------------
	server emit, client on:
		'feedFromServer': nhận data dạng string (bên dưới)	
	client emit, server on:
		'changeFeedData': nhận data dạng string (như trên)
	
	// const patternData = `{
        //     "topic":"quan260402/feeds/bk-iot-led",
        //     "message":{dưới
        //         "id":1,
        //         "name":"LED",
        //         "data":911,
        //         "unit":""
        //     }
        // }`;
        
