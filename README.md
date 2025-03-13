# Tổng quan Hệ thống
![SODOKLTN](https://github.com/user-attachments/assets/459fa346-4ecc-4cc3-b7e0-54c47d7455c8)
 Xây dựng một hệ thống giám sát tập trung các màn hình HMI bằng camera, nhằm lưu trữ và hiển thị dữ liệu tập trung dễ dàng cho việc giám sát. 
# Phần Hệ thống đã triển khai
![image](https://github.com/user-attachments/assets/479e5199-b3d9-49ce-a41a-3c672e0aeb86)

# Phần Cứng: 
* **Phân loại các node:** Chia làm 2 loại node, một node sử dụng trong phạm vi kết nối mạng WiFi kết nối đến máy chủ cơ sở dữ liệu MongoDB, node còn lại được sử dụng ngoài phạm vi của mạng WiFi, do đó sử dụng kết nối thay thế là sóng radio 2.4ghz và giao tiếp với hệ thống thông qua Gateway. 
* Xây dựng Gateway đóng vai trò như điểm nhận dữ liệu và gửi yêu cầu đến các node nằm ngoài vụng mạng WiFi thông qua sóng radio 2.4ghz bằng module NRF24L01.
# Phần mềm: 
* **Sử dụng MQTT Broker:** Đóng vai trò là nơi trung chuyển các đoạn mã hóa hình ảnh được gửi từ Gateway đến máy chủ cơ sở dữ liệu MongoDB.
* **Xây dựng Website quản lý và giám sát dữ liệu:** Xây dựng các API giao tiếp với cơ sở dữ liệu giúp Website trực quan hóa dữ liệu.
* **Xây dựng ứng dụng điều khiển Camera bằng thư viện Winform của C#:** Giúp người giám sát tùy chỉnh các vùng đọc và đặt tên cho các dữ liệu nhận được, đáp ứng nhu cầu tái sử dụng của hệ thống khi các máy móc trong nhà máy thay đổi. 
## Ảnh Màn Hình HMI Quản Lý
![image](https://github.com/user-attachments/assets/a9d40ece-a144-4254-a1e5-eb7dfdea7b50)
## Giao diện trang Web Quản lý
![image](https://github.com/user-attachments/assets/8faf9eff-df10-4984-a9c5-0ed8151852f6)
![image](https://github.com/user-attachments/assets/df2e8cbc-d1e2-4298-8517-8c00ae321b29)
![image](https://github.com/user-attachments/assets/92dff914-896b-4d21-a242-4504d0189445)
![image](https://github.com/user-attachments/assets/d628d8fa-6d22-42fa-b378-7018dc7c81ef)

