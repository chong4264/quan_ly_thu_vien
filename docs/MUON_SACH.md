# Quản lý độc giả và mượn online

Khởi động backend và frontend ở hai cửa sổ terminal trong thư mục dự án.

```powershell
npm --prefix backend run develop
npm --prefix frontend run dev
```

Strapi tự đồng bộ bảng `loan_requests` và bổ sung quyền cần thiết khi khởi động.

## Cấp hồ sơ độc giả

1. Quản trị viên tạo User trong Strapi Content Manager, chọn role Authenticated, Confirmed = true và Blocked = false.
2. Thủ thư mở **Quản lý độc giả → Thêm độc giả**.
3. Nhập mã sinh viên/cán bộ, họ tên, chọn nhóm độc giả có hạn mức và thời hạn mượn hợp lệ.
4. Liên kết User tương ứng và lưu hồ sơ. Mỗi tài khoản gắn với một hồ sơ.

Hồ sơ chưa liên kết tài khoản vẫn mượn tại quầy bằng mã sinh viên hoặc mã thẻ. Muốn mượn online và xem lịch sử cá nhân phải liên kết User.

Thủ thư có thể tìm kiếm, sửa thông tin, khóa/mở thẻ. Không đổi chủ tài khoản đã liên kết. Hồ sơ có lịch sử mượn hoặc yêu cầu mượn không được xóa; có thể khóa thẻ để ngừng cho mượn.

## Đăng ký mượn online

1. Độc giả mở **Tra cứu sách → Chi tiết → Đăng ký mượn online**.
2. Nhập ghi chú nếu cần và gửi yêu cầu.
3. Theo dõi ở **Yêu cầu mượn**. Độc giả có thể hủy yêu cầu đang chờ.
4. Khi đến quầy, đưa thẻ cho thủ thư.
5. Thủ thư mở **Yêu cầu mượn online**, nhập/quét mã bản sao đúng đầu sách và chọn **Giao sách & lập phiếu**. Có thể từ chối kèm lý do.

Yêu cầu không giữ chỗ bản sao. Phiếu mượn và hạn trả chỉ bắt đầu khi thủ thư giao sách. Hệ thống kiểm tra lại thẻ, sách quá hạn, hạn mức và tình trạng bản sao lúc giao. Sách đang mượn cộng số yêu cầu chờ không được vượt hạn mức khi gửi yêu cầu mới.

Trạng thái yêu cầu gồm chờ nhận tại quầy, đã giao sách, đã từ chối và đã hủy. Sau khi giao, sách xuất hiện ở **Sách đang mượn**; việc trả và gia hạn dùng luồng hiện có.

## Kiểm tra tích hợp PostgreSQL

```powershell
npm --prefix backend run build
node backend/scripts/check-circulation.cjs
```

Script dùng kết nối PostgreSQL cục bộ từ `backend/.env`, tạo database tạm tên `library_check_*` rồi xóa sau khi kiểm tra. Tài khoản PostgreSQL cần quyền tạo database. Script kiểm tra phân quyền, liên kết độc giả, yêu cầu online, lập phiếu và các thao tác đồng thời.
