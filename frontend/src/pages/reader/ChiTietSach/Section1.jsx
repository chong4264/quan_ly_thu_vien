import { useToast } from "../../../context/ToastContext";

export default function Section1() {
  const toast = useToast();
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-space-sm bg-surface-container-lowest p-space-md rounded-md shadow-sm">
        {" "}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant flex-wrap"
        >
          {" "}
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            {" "}
            <span className="material-symbols-outlined text-[16px]">home</span>
            Trang chủ
          </a>{" "}
          <span className="text-outline">/</span>{" "}
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="hover:text-primary transition-colors"
          >
            Khoa học tự nhiên & Toán học
          </a>{" "}
          <span className="text-outline">/</span>{" "}
          <span className="text-on-surface font-semibold">
            Chi tiết sách
          </span>{" "}
        </nav>{" "}
        <div className="flex items-center gap-space-xs">
          {" "}
          <span className="font-code-md text-code-md bg-surface-container-low text-on-surface-variant px-space-sm py-1 rounded-sm">
            ID: BK-1001-MAT
          </span>{" "}
          <button
            className="h-9 px-space-sm bg-surface-container-lowest hover:bg-surface-container-low text-on-surface rounded-sm font-label-md text-label-md flex items-center gap-1 shadow-sm transition-colors"
            id="btn-share"
            title="Sao chép liên kết chia sẻ"
            onClick={() => toast("Chia sẻ")}
          >
            {" "}
            <span className="material-symbols-outlined text-[18px]">
              share
            </span>{" "}
            <span className="hidden sm:inline">Chia sẻ</span>{" "}
          </button>{" "}
          <button
            className="h-9 px-space-sm bg-surface-container-lowest hover:bg-surface-container-low text-on-surface rounded-sm font-label-md text-label-md flex items-center gap-1 shadow-sm transition-colors"
            id="btn-favorite"
            title="Thêm vào danh sách mong muốn"
            onClick={() => toast("Lưu yêu thích")}
          >
            {" "}
            <span
              className="material-symbols-outlined text-[18px] text-error"
              id="fav-icon"
            >
              bookmark_border
            </span>{" "}
            <span className="hidden sm:inline">Lưu yêu thích</span>{" "}
          </button>{" "}
        </div>{" "}
      </div>
    </>
  );
}
