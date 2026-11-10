import { useState } from "react";
import { useToast } from "../../../context/ToastContext";

export default function DaiSoTuyenTinh() {
  const [q, setQ] = useState("");
  const [gone, setGone] = useState(() => new Set());
  const remove = (i) => setGone((s) => new Set(s).add(i));
  const match = (q, t) => !q.trim() || t.includes(q.trim().toLowerCase());
  const toast = useToast();
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
        {" "}
        <div className="lg:col-span-4 flex flex-col gap-space-md">
          {" "}
          <div className="bg-surface-container-lowest p-space-lg rounded-md shadow-sm flex flex-col items-center">
            {" "}
            <div className="relative w-full max-w-[280px] aspect-[1/1.45] rounded-sm shadow-md overflow-hidden bg-surface-container-high group">
              {" "}
              <img
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                data-alt="Academic textbook cover for Linear Algebra and Applied Differential Geometry with deep indigo blue background, clean geometric vector curves, gold mathematical symbols, elegant serif Vietnamese typography by Vietnam Education Publishing House, professional studio lighting with sharp detail"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBViRgWDVLPgiv35z8BBjLuZgcVS1hXUElsQ6bZxcDQVTFD6QNWGRlOeu1dJYDzzCA--5a5EWZUNXvc9JAablfKjPLbqe4gYubpazgn0VX1iF0DfPjzrQY-j5nAgp2ctWuYS4tANMc35r-zNBMFVgM97F22TDcayfx6hvirefsw_2kudf_LP87Sr5Pe0mdV95Chr6QzXJw7gZ0emLtMYQcHB5OoHGCkpjFNICi66A"
              />{" "}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {" "}
                <span className="bg-surface-container-lowest/95 backdrop-blur-sm text-secondary font-label-sm text-label-sm px-2 py-0.5 rounded-sm font-semibold shadow-sm flex items-center gap-1">
                  {" "}
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" /> Còn
                  6/8 bản sẵn sàng
                </span>{" "}
                <span className="bg-primary-container text-on-primary font-code-md text-label-sm px-2 py-0.5 rounded-sm font-semibold shadow-sm w-fit">
                  DDC: 512.5
                </span>{" "}
              </div>{" "}
              <div className="absolute bottom-2 right-2 bg-surface-dim/90 backdrop-blur-sm text-on-surface px-2 py-0.5 rounded-sm font-code-md text-label-sm shadow-sm">
                Tái bản 2023
              </div>{" "}
            </div>{" "}
            <div className="w-full mt-space-lg grid grid-cols-2 gap-space-sm text-center">
              {" "}
              <div className="bg-surface-container-low p-space-sm rounded-sm">
                {" "}
                <span className="block font-label-sm text-label-sm text-on-surface-variant">
                  Lượt mượn kỳ này
                </span>{" "}
                <span className="block font-headline-sm text-headline-sm font-bold text-primary">
                  42 lượt
                </span>{" "}
              </div>{" "}
              <div className="bg-surface-container-low p-space-sm rounded-sm">
                {" "}
                <span className="block font-label-sm text-label-sm text-on-surface-variant">
                  Đánh giá chuyên môn
                </span>{" "}
                <span className="block font-headline-sm text-headline-sm font-bold text-secondary flex items-center justify-center gap-0.5">
                  4.9{" "}
                  <span className="material-symbols-outlined text-[16px] text-tertiary">
                    star
                  </span>{" "}
                </span>{" "}
              </div>{" "}
            </div>{" "}
            <div className="w-full mt-space-md flex flex-col gap-space-sm">
              {" "}
              <button
                className="w-full h-10 bg-primary-container hover:bg-primary text-on-primary rounded-sm font-label-lg text-label-lg font-semibold flex items-center justify-center gap-2 shadow-sm transition-all focus:ring-2 focus:ring-primary focus:outline-none"
                id="btn-primary-hold"
                onClick={() => toast("Đặt mượn giữ chỗ (Hold Book)")}
              >
                {" "}
                <span className="material-symbols-outlined text-[20px]">
                  assignment_turned_in
                </span>
                Đặt mượn giữ chỗ (Hold Book)
              </button>{" "}
              <div className="text-center font-label-sm text-label-sm text-on-surface-variant flex items-center justify-center gap-1">
                {" "}
                <span className="material-symbols-outlined text-[14px] text-secondary">
                  info
                </span>
                Hạn nhận sách trong vòng 24h sau khi duyệt
              </div>{" "}
            </div>{" "}
          </div>{" "}
          <div className="bg-surface-container-lowest p-space-md rounded-md shadow-sm flex flex-col gap-space-sm">
            {" "}
            <div className="flex items-center justify-between">
              {" "}
              <span className="font-headline-sm text-headline-sm font-semibold text-on-surface flex items-center gap-1.5">
                {" "}
                <span className="material-symbols-outlined text-primary text-[20px]">
                  explore
                </span>
                Sơ đồ định vị sách
              </span>{" "}
              <span className="font-code-md text-code-md text-primary font-bold bg-primary-fixed px-2 py-0.5 rounded-sm">
                Kệ K03 - T2
              </span>{" "}
            </div>{" "}
            <div className="bg-surface-container-low p-space-md rounded-sm flex flex-col gap-space-xs text-on-surface font-body-sm text-body-sm">
              {" "}
              <div className="flex justify-between">
                {" "}
                <span className="text-on-surface-variant">Khu vực:</span>{" "}
                <span className="font-semibold">
                  Phòng đọc Mượn Tự chọn (Tầng 2)
                </span>{" "}
              </div>{" "}
              <div className="flex justify-between">
                {" "}
                <span className="text-on-surface-variant">Dãy tủ:</span>{" "}
                <span className="font-semibold">
                  Toán ứng dụng & Tin học
                </span>{" "}
              </div>{" "}
              <div className="flex justify-between">
                {" "}
                <span className="text-on-surface-variant">Cụm kệ:</span>{" "}
                <span className="font-semibold">
                  K03 - Mặt A - Ngăn số 04
                </span>{" "}
              </div>{" "}
            </div>{" "}
            <p className="font-label-sm text-label-sm text-on-surface-variant italic">
              * Học sinh có thể đến trực tiếp giá K03 để lấy tài liệu hoặc xuất
              trình mã Barcode cho thủ thư tại quầy Circulation Desk.
            </p>{" "}
          </div>{" "}
        </div>{" "}
        <div className="lg:col-span-8 flex flex-col gap-space-md">
          {" "}
          <div className="bg-surface-container-lowest p-space-xl rounded-md shadow-sm flex flex-col gap-space-md">
            {" "}
            <div className="flex flex-col gap-1">
              {" "}
              <div className="flex items-center gap-2 flex-wrap">
                {" "}
                <span className="bg-surface-container text-on-surface-variant font-label-sm text-label-sm px-2 py-0.5 rounded-sm uppercase tracking-wider font-semibold">
                  Giáo trình Đạt chuẩn Bộ GD&ĐT
                </span>{" "}
                <span className="bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm px-2 py-0.5 rounded-sm font-semibold">
                  Bản in gốc 2023
                </span>{" "}
              </div>{" "}
              <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">
                Đại số Tuyến tính & Hình học Vi phân Ứng dụng
              </h1>{" "}
              <p className="font-body-lg text-body-lg text-on-surface-variant font-medium">
                Tác giả:{" "}
                <span className="text-primary font-semibold">
                  GS. TSKH. Nguyễn Cảnh Toàn
                </span>{" "}
                (Chủ biên), PGS. TS. Hoàng Xuân Phú
              </p>{" "}
            </div>{" "}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-space-md pt-space-sm">
              {" "}
              <div className="flex flex-col bg-surface-container-low p-space-sm rounded-sm">
                {" "}
                <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                  Ký hiệu Cutter-Sanborn
                </span>{" "}
                <span className="font-code-md text-code-md text-on-surface font-bold mt-1">
                  512.5 T482N 2023
                </span>{" "}
              </div>{" "}
              <div className="flex flex-col bg-surface-container-low p-space-sm rounded-sm">
                {" "}
                <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                  Mã chuẩn ISBN-13
                </span>{" "}
                <span className="font-code-md text-code-md text-on-surface font-bold mt-1">
                  978-604-0-28194-4
                </span>{" "}
              </div>{" "}
              <div className="flex flex-col bg-surface-container-low p-space-sm rounded-sm">
                {" "}
                <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                  Nhà xuất bản
                </span>{" "}
                <span className="font-body-md text-body-md text-on-surface font-semibold mt-1">
                  NXB Giáo Dục Việt Nam
                </span>{" "}
              </div>{" "}
              <div className="flex flex-col bg-surface-container-low p-space-sm rounded-sm">
                {" "}
                <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                  Quy cách ấn bản
                </span>{" "}
                <span className="font-body-md text-body-md text-on-surface font-semibold mt-1">
                  488 trang (Bìa mềm cán mờ)
                </span>{" "}
              </div>{" "}
              <div className="flex flex-col bg-surface-container-low p-space-sm rounded-sm">
                {" "}
                <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                  Ngôn ngữ & Quốc gia
                </span>{" "}
                <span className="font-body-md text-body-md text-on-surface font-semibold mt-1">
                  Tiếng Việt (VIE)
                </span>{" "}
              </div>{" "}
              <div className="flex flex-col bg-surface-container-low p-space-sm rounded-sm">
                {" "}
                <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                  Số phân loại Dewey (DDC)
                </span>{" "}
                <span className="font-code-md text-code-md text-primary font-bold mt-1">
                  512.5 - Đại số đại cương
                </span>{" "}
              </div>{" "}
            </div>{" "}
            <div className="mt-space-xs flex flex-col gap-space-xs">
              {" "}
              <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface flex items-center gap-1.5">
                {" "}
                <span className="material-symbols-outlined text-primary text-[20px]">
                  subject
                </span>
                Tóm tắt nội dung học thuật
              </h2>{" "}
              <div className="text-on-surface-variant font-body-md text-body-md leading-relaxed text-justify space-y-2">
                {" "}
                <p>
                  Giáo trình{" "}
                  <strong>
                    "Đại số Tuyến tính & Hình học Vi phân Ứng dụng"
                  </strong>{" "}
                  cung cấp hệ thống lý thuyết cấu trúc đại số trừu tượng hiện
                  đại gắn liền với các bài toán hình học vi phân đa tạp phục vụ
                  các đội tuyển học sinh giỏi quốc gia môn Toán và Tin học
                  trường THPT Chuyên. Nội dung bao gồm không gian vector nhiều
                  chiều, ánh xạ tuyến tính, dạng toàn phương và tích vô hướng
                  chuẩn hóa.
                </p>{" "}
                <p>
                  Phần II của tác phẩm phân tích sâu ứng dụng của ma trận hiệp
                  phương sai, phép phân rã trị riêng (SVD) và đường cong trơn
                  trong không gian Euclid, đồng thời liên hệ trực tiếp đến các
                  thuật toán máy học hiện đại (Machine Learning), xử lý đồ họa
                  máy tính 3D và các bài toán phân tích dữ liệu lớn.
                </p>{" "}
              </div>{" "}
              <div className="flex flex-wrap gap-1.5 mt-space-xs">
                {" "}
                <span className="bg-surface-container text-on-surface-variant px-space-sm py-0.5 rounded-sm font-label-sm text-label-sm font-medium">
                  #ToanHocChuyen
                </span>{" "}
                <span className="bg-surface-container text-on-surface-variant px-space-sm py-0.5 rounded-sm font-label-sm text-label-sm font-medium">
                  #DaiSoTuyenTinh
                </span>{" "}
                <span className="bg-surface-container text-on-surface-variant px-space-sm py-0.5 rounded-sm font-label-sm text-label-sm font-medium">
                  #HinhHocViPhan
                </span>{" "}
                <span className="bg-surface-container text-on-surface-variant px-space-sm py-0.5 rounded-sm font-label-sm text-label-sm font-medium">
                  #ChuyenChuVanAn
                </span>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
          <div className="bg-surface-container-lowest p-space-lg rounded-md shadow-sm flex flex-col gap-space-md">
            {" "}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
              {" "}
              <div>
                {" "}
                <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2">
                  {" "}
                  <span className="material-symbols-outlined text-secondary text-[22px]">
                    inventory_2
                  </span>
                  Danh sách bản sao tại kho (Sổ đăng ký cá biệt)
                </h2>{" "}
                <p className="font-label-sm text-label-sm text-on-surface-variant">
                  Quản lý hiện trạng vật lý từng cuốn theo mã vạch định danh thư
                  viện
                </p>{" "}
              </div>{" "}
              <div className="flex items-center gap-space-xs">
                {" "}
                <span className="font-label-sm text-label-sm px-2 py-1 rounded-sm bg-surface-container font-semibold text-on-surface">
                  Tổng cộng: 08 bản
                </span>{" "}
              </div>{" "}
            </div>{" "}
            <div className="overflow-x-auto rounded-none shadow-none">
              {" "}
              <table className="w-full text-left font-body-md text-body-md">
                {" "}
                <thead className="bg-surface-container-low font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  {" "}
                  <tr>
                    {" "}
                    <th className="py-2.5 px-3" scope="col">
                      Mã ĐKCB
                    </th>{" "}
                    <th className="py-2.5 px-3" scope="col">
                      Mã Barcode
                    </th>{" "}
                    <th className="py-2.5 px-3" scope="col">
                      Vị trí lưu trữ
                    </th>{" "}
                    <th className="py-2.5 px-3" scope="col">
                      Hiện trạng
                    </th>{" "}
                    <th className="py-2.5 px-3" scope="col">
                      Tình trạng lưu thông
                    </th>{" "}
                    <th className="py-2.5 px-3 text-right" scope="col">
                      Thao tác
                    </th>{" "}
                  </tr>{" "}
                </thead>{" "}
                <tbody className="divide-y divide-surface-container">
                  {" "}
                  <tr
                    className="hover:bg-surface-container-low transition-colors"
                    hidden={
                      gone.has(0) ||
                      !match(
                        q,
                        "dk-09412 bar-882019412 kệ k03-t2-04 mới 98% có sẵn trên kệ giữ bản này",
                      )
                    }
                  >
                    {" "}
                    <td className="py-3 px-3 font-code-md text-code-md font-bold text-on-surface">
                      DK-09412
                    </td>{" "}
                    <td className="py-3 px-3 font-code-md text-code-md text-on-surface-variant">
                      BAR-882019412
                    </td>{" "}
                    <td className="py-3 px-3 text-body-sm font-medium">
                      Kệ K03-T2-04
                    </td>{" "}
                    <td className="py-3 px-3">
                      {" "}
                      <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-secondary font-semibold">
                        {" "}
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary" />{" "}
                        Mới 98%
                      </span>{" "}
                    </td>{" "}
                    <td className="py-3 px-3">
                      {" "}
                      <span className="inline-block bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm px-2 py-0.5 rounded-sm font-semibold">
                        Có sẵn trên kệ
                      </span>{" "}
                    </td>{" "}
                    <td className="py-3 px-3 text-right">
                      {" "}
                      <button
                        className="hold-copy-btn h-7 px-3 bg-primary-container hover:bg-primary text-on-primary rounded-sm font-label-sm text-label-sm font-medium transition-colors"
                        data-code="DK-09412"
                        onClick={() => toast("Giữ bản này")}
                      >
                        Giữ bản này
                      </button>{" "}
                    </td>{" "}
                  </tr>{" "}
                  <tr
                    className="hover:bg-surface-container-low transition-colors"
                    hidden={
                      gone.has(1) ||
                      !match(
                        q,
                        "dk-09413 bar-882019413 kệ k03-t2-04 tốt (95%) có sẵn trên kệ giữ bản này",
                      )
                    }
                  >
                    {" "}
                    <td className="py-3 px-3 font-code-md text-code-md font-bold text-on-surface">
                      DK-09413
                    </td>{" "}
                    <td className="py-3 px-3 font-code-md text-code-md text-on-surface-variant">
                      BAR-882019413
                    </td>{" "}
                    <td className="py-3 px-3 text-body-sm font-medium">
                      Kệ K03-T2-04
                    </td>{" "}
                    <td className="py-3 px-3">
                      {" "}
                      <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-secondary font-semibold">
                        {" "}
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary" />{" "}
                        Tốt (95%)
                      </span>{" "}
                    </td>{" "}
                    <td className="py-3 px-3">
                      {" "}
                      <span className="inline-block bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm px-2 py-0.5 rounded-sm font-semibold">
                        Có sẵn trên kệ
                      </span>{" "}
                    </td>{" "}
                    <td className="py-3 px-3 text-right">
                      {" "}
                      <button
                        className="hold-copy-btn h-7 px-3 bg-primary-container hover:bg-primary text-on-primary rounded-sm font-label-sm text-label-sm font-medium transition-colors"
                        data-code="DK-09413"
                        onClick={() => toast("Giữ bản này")}
                      >
                        Giữ bản này
                      </button>{" "}
                    </td>{" "}
                  </tr>{" "}
                  <tr
                    className="hover:bg-surface-container-low transition-colors"
                    hidden={
                      gone.has(2) ||
                      !match(
                        q,
                        "dk-09414 bar-882019414 kệ k03-t2-04 tốt (90%) có sẵn trên kệ giữ bản này",
                      )
                    }
                  >
                    {" "}
                    <td className="py-3 px-3 font-code-md text-code-md font-bold text-on-surface">
                      DK-09414
                    </td>{" "}
                    <td className="py-3 px-3 font-code-md text-code-md text-on-surface-variant">
                      BAR-882019414
                    </td>{" "}
                    <td className="py-3 px-3 text-body-sm font-medium">
                      Kệ K03-T2-04
                    </td>{" "}
                    <td className="py-3 px-3">
                      {" "}
                      <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-secondary font-semibold">
                        {" "}
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary" />{" "}
                        Tốt (90%)
                      </span>{" "}
                    </td>{" "}
                    <td className="py-3 px-3">
                      {" "}
                      <span className="inline-block bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm px-2 py-0.5 rounded-sm font-semibold">
                        Có sẵn trên kệ
                      </span>{" "}
                    </td>{" "}
                    <td className="py-3 px-3 text-right">
                      {" "}
                      <button
                        className="hold-copy-btn h-7 px-3 bg-primary-container hover:bg-primary text-on-primary rounded-sm font-label-sm text-label-sm font-medium transition-colors"
                        data-code="DK-09414"
                        onClick={() => toast("Giữ bản này")}
                      >
                        Giữ bản này
                      </button>{" "}
                    </td>{" "}
                  </tr>{" "}
                  <tr
                    className="hover:bg-surface-container-low transition-colors"
                    hidden={
                      gone.has(3) ||
                      !match(
                        q,
                        "dk-09415 bar-882019415 mượn về nhà bình thường đang mượn (đến 15/11) hết lượt",
                      )
                    }
                  >
                    {" "}
                    <td className="py-3 px-3 font-code-md text-code-md font-bold text-on-surface">
                      DK-09415
                    </td>{" "}
                    <td className="py-3 px-3 font-code-md text-code-md text-on-surface-variant">
                      BAR-882019415
                    </td>{" "}
                    <td className="py-3 px-3 text-body-sm font-medium">
                      Mượn về nhà
                    </td>{" "}
                    <td className="py-3 px-3">
                      {" "}
                      <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant font-medium">
                        Bình thường
                      </span>{" "}
                    </td>{" "}
                    <td className="py-3 px-3">
                      {" "}
                      <span className="inline-block bg-surface-container text-tertiary font-label-sm text-label-sm px-2 py-0.5 rounded-sm font-semibold">
                        Đang mượn (đến 15/11)
                      </span>{" "}
                    </td>{" "}
                    <td className="py-3 px-3 text-right">
                      {" "}
                      <button
                        className="h-7 px-3 bg-surface-container text-outline rounded-sm font-label-sm text-label-sm font-medium cursor-not-allowed"
                        disabled
                        onClick={() => toast("Hết lượt")}
                      >
                        Hết lượt
                      </button>{" "}
                    </td>{" "}
                  </tr>{" "}
                  <tr
                    className="hover:bg-surface-container-low transition-colors"
                    hidden={
                      gone.has(4) ||
                      !match(
                        q,
                        "dk-09416 bar-882019416 bàn phân loại t1 mới 100% đang nhập kho đặt trước",
                      )
                    }
                  >
                    {" "}
                    <td className="py-3 px-3 font-code-md text-code-md font-bold text-on-surface">
                      DK-09416
                    </td>{" "}
                    <td className="py-3 px-3 font-code-md text-code-md text-on-surface-variant">
                      BAR-882019416
                    </td>{" "}
                    <td className="py-3 px-3 text-body-sm font-medium">
                      Bàn phân loại T1
                    </td>{" "}
                    <td className="py-3 px-3">
                      {" "}
                      <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-secondary font-semibold">
                        Mới 100%
                      </span>{" "}
                    </td>{" "}
                    <td className="py-3 px-3">
                      {" "}
                      <span className="inline-block bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm px-2 py-0.5 rounded-sm font-semibold">
                        Đang nhập kho
                      </span>{" "}
                    </td>{" "}
                    <td className="py-3 px-3 text-right">
                      {" "}
                      <button
                        className="hold-copy-btn h-7 px-3 bg-surface-container hover:bg-surface-container-high text-primary font-semibold rounded-sm font-label-sm text-label-sm transition-colors"
                        data-code="DK-09416"
                        onClick={() => toast("Đặt trước")}
                      >
                        Đặt trước
                      </button>{" "}
                    </td>{" "}
                  </tr>{" "}
                </tbody>{" "}
              </table>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>
    </>
  );
}
