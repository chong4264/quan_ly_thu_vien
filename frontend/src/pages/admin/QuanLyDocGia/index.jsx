import { useState, useEffect, useCallback } from "react";
import { useToast } from "../../../context/ToastContext";
import QuanLyDocGia from "./QuanLyDocGia";
import Section2 from "./Section2";
import Section3 from "./Section3";
import Section4 from "./Section4";

const API_BASE = "http://localhost:1337/api";

const getHeaders = () => {
  const token = localStorage.getItem("jwt") || localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export default function QuanLyDocGiaPage() {
  const toast = useToast();

  const [patrons, setPatrons] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    pageCount: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({ q: "", className: "", status: "" });

  const [stats, setStats] = useState({
    totalPatrons: 0,
    activePatrons: 0,
    lockedPatrons: 0,
    overdueCount: 0,
  });
  const [patronTypes, setPatronTypes] = useState([]);

  const [selectedIds, setSelectedIds] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPatron, setEditingPatron] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    studentCode: "",
    className: "",
    cardBarcode: "",
    email: "",
    phone: "",
    parentName: "",
    parentPhone: "",
    cardExpiresAt: "",
    patronType: "",
    cardStatus: "active",
  });

  const fetchPatrons = useCallback(
    async (page, pageSize, currentFilters) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (currentFilters.q) params.append("q", currentFilters.q);
        if (currentFilters.className && currentFilters.className !== "all") {
          params.append("className", currentFilters.className);
        }
        if (currentFilters.status && currentFilters.status !== "all") {
          params.append("status", currentFilters.status);
        }
        params.append("page", String(page));
        params.append("pageSize", String(pageSize));

        const res = await fetch(
          `${API_BASE}/patrons/admin-list?${params.toString()}`,
          {
            headers: getHeaders(),
          },
        );
        if (!res.ok) throw new Error("Không thể tải danh sách độc giả");
        const json = await res.json();

        setPatrons(json.data || []);
        if (json.meta?.pagination) {
          setPagination(json.meta.pagination);
          setStats((prev) => ({
            ...prev,
            totalPatrons: json.meta.pagination.total,
          }));
        }
        setSelectedIds([]);
      } catch (err) {
        toast(err.message || "Lỗi tải dữ liệu độc giả");
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  const fetchOverviewAndTypes = useCallback(async () => {
    try {
      const [overviewRes, typesRes, lockedRes] = await Promise.all([
        fetch(`${API_BASE}/stats/overview`, { headers: getHeaders() }),
        fetch(`${API_BASE}/patron-types`, { headers: getHeaders() }),
        fetch(`${API_BASE}/patrons/admin-list?status=locked&pageSize=1`, {
          headers: getHeaders(),
        }),
      ]);

      if (overviewRes.ok) {
        const ov = await overviewRes.json();
        setStats((prev) => ({
          ...prev,
          activePatrons: ov.activePatrons || 0,
          overdueCount: ov.overdueCount || 0,
        }));
      }
      if (typesRes.ok) {
        const tp = await typesRes.json();
        setPatronTypes(tp.data || tp || []);
      }
      if (lockedRes.ok) {
        const lk = await lockedRes.json();
        setStats((prev) => ({
          ...prev,
          lockedPatrons: lk.meta?.pagination?.total || 0,
        }));
      }
    } catch (err) {
      console.error("Lỗi tải thống kê:", err);
    }
  }, []);

  // Sử dụng setTimeout/Queue Microtask để thực hiện fetch lúc khởi tạo mà không vi phạm quy tắc set-state-in-effect
  useEffect(() => {
    let isMounted = true;
    queueMicrotask(() => {
      if (isMounted) {
        fetchPatrons(1, pagination.pageSize, filters);
        fetchOverviewAndTypes();
      }
    });
    return () => {
      isMounted = false;
    };
  }, [filters, pagination.pageSize, fetchPatrons, fetchOverviewAndTypes]);

  const handleOpenAddModal = () => {
    setEditingPatron(null);
    setFormData({
      fullName: "",
      studentCode: "",
      className: "",
      cardBarcode: "",
      email: "",
      phone: "",
      parentName: "",
      parentPhone: "",
      cardExpiresAt: "",
      patronType: patronTypes[0]?.documentId || "",
      cardStatus: "active",
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (patron) => {
    setEditingPatron(patron);
    setFormData({
      fullName: patron.fullName || "",
      studentCode: patron.studentCode || "",
      className: patron.className || "",
      cardBarcode: patron.cardBarcode || "",
      email: patron.email || "",
      phone: patron.phone || "",
      parentName: patron.parentName || "",
      parentPhone: patron.parentPhone || "",
      cardExpiresAt: patron.cardExpiresAt
        ? patron.cardExpiresAt.slice(0, 10)
        : "",
      patronType: patron.patronType?.documentId || "",
      cardStatus: patron.cardStatus || "active",
    });
    setModalOpen(true);
  };

  const handleSavePatron = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        data: {
          ...formData,
          patronType: formData.patronType || null,
          cardExpiresAt: formData.cardExpiresAt || null,
        },
      };
      const url = editingPatron
        ? `${API_BASE}/patrons/${editingPatron.documentId}`
        : `${API_BASE}/patrons`;
      const method = editingPatron ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Lưu hồ sơ độc giả thất bại");

      toast(
        editingPatron ? "Đã cập nhật hồ sơ độc giả" : "Đã thêm độc giả mới",
      );
      setModalOpen(false);
      fetchPatrons(pagination.page, pagination.pageSize, filters);
      fetchOverviewAndTypes();
    } catch (err) {
      toast(err.message);
    }
  };

  const handleBulkStatus = async (ids, action) => {
    if (!ids.length) return toast("Vui lòng chọn ít nhất 1 độc giả");
    try {
      const endpoint =
        action === "lock" ? "/patrons/bulk-lock" : "/patrons/bulk-unlock";
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error("Thao tác cập nhật trạng thái thẻ thất bại");

      toast(
        action === "lock"
          ? `Đã khóa ${ids.length} thẻ`
          : `Đã mở khóa ${ids.length} thẻ`,
      );
      fetchPatrons(pagination.page, pagination.pageSize, filters);
      fetchOverviewAndTypes();
    } catch (err) {
      toast(err.message);
    }
  };

  const handleImportCSV = async (file) => {
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) return toast("File CSV không có dữ liệu");

      const headers = lines[0].split(",").map((h) => h.trim());
      const rows = lines.slice(1).map((line) => {
        const cols = line.split(",").map((c) => c.trim());
        const obj = {};
        headers.forEach((h, idx) => {
          obj[h] = cols[idx] || "";
        });
        return obj;
      });

      const res = await fetch(`${API_BASE}/patrons/import`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ data: rows }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error?.message || "Import thất bại");

      toast(
        `Import thành công ${result.created} độc giả. Lỗi: ${result.failed?.length || 0}`,
      );
      fetchPatrons(1, pagination.pageSize, filters);
      fetchOverviewAndTypes();
    } catch (err) {
      toast(err.message);
    }
  };

  const handleExportCards = async () => {
    try {
      const query =
        selectedIds.length > 0 ? `?ids=${selectedIds.join(",")}` : "";
      const res = await fetch(`${API_BASE}/patrons/export-cards${query}`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error("Không thể xuất dữ liệu thẻ RFID");
      const json = await res.json();
      const cards = json.data || [];

      const csvHeader = "HoTen,MaHS,Lop,MaTheBarcode,NgayHetHan\n";
      const csvRows = cards
        .map(
          (c) =>
            `"${c.fullName}","${c.studentCode}","${c.className}","${c.cardBarcode}","${c.cardExpiresAt || ""}"`,
        )
        .join("\n");
      const blob = new Blob(["\uFEFF" + csvHeader + csvRows], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `the-rfid-doc-gia-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast(`Đã xuất ${cards.length} thẻ RFID`);
    } catch (err) {
      toast(err.message);
    }
  };

  return (
    <main className="relative pt-16 bg-surface min-h-screen">
      <div className="flex flex-col w-full">
        <div className="w-full max-w-[1600px] mx-auto px-margin md:px-margin-desktop py-space-lg space-y-space-lg">
          <QuanLyDocGia
            totalPatrons={stats.totalPatrons}
            onOpenAddModal={handleOpenAddModal}
            onImportCSV={handleImportCSV}
            onExportCards={handleExportCards}
          />
          <Section2 stats={stats} />
          <Section3
            patrons={patrons}
            loading={loading}
            pagination={pagination}
            filters={filters}
            setFilters={setFilters}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            onPageChange={(p) => fetchPatrons(p, pagination.pageSize, filters)}
            onPageSizeChange={(size) =>
              setPagination((prev) => ({ ...prev, pageSize: size, page: 1 }))
            }
            onEditPatron={handleOpenEditModal}
            onBulkStatus={handleBulkStatus}
          />
          <Section4
            onSyncData={() => {
              fetchPatrons(1, pagination.pageSize, filters);
              fetchOverviewAndTypes();
            }}
          />
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSavePatron}
            className="bg-surface-container-lowest rounded-sm shadow-lg w-full max-w-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-surface-container pb-3">
              <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                {editingPatron ? "Cập nhật hồ sơ độc giả" : "Thêm mới độc giả"}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-body-sm text-body-sm">
              <div>
                <label className="block font-semibold mb-1">Họ và tên *</label>
                <input
                  required
                  className="w-full h-9 px-3 bg-surface-container-low rounded-sm"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  Mã học sinh / CBGV *
                </label>
                <input
                  required
                  className="w-full h-9 px-3 bg-surface-container-low rounded-sm"
                  value={formData.studentCode}
                  onChange={(e) =>
                    setFormData({ ...formData, studentCode: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  Lớp / Đơn vị *
                </label>
                <input
                  required
                  className="w-full h-9 px-3 bg-surface-container-low rounded-sm"
                  value={formData.className}
                  onChange={(e) =>
                    setFormData({ ...formData, className: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  Mã thẻ / Barcode RFID *
                </label>
                <input
                  required
                  className="w-full h-9 px-3 bg-surface-container-low rounded-sm"
                  value={formData.cardBarcode}
                  onChange={(e) =>
                    setFormData({ ...formData, cardBarcode: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Nhóm độc giả</label>
                <select
                  className="w-full h-9 px-3 bg-surface-container-low rounded-sm"
                  value={formData.patronType}
                  onChange={(e) =>
                    setFormData({ ...formData, patronType: e.target.value })
                  }
                >
                  <option value="">-- Chọn nhóm --</option>
                  {patronTypes.map((pt) => (
                    <option key={pt.documentId} value={pt.documentId}>
                      {pt.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  Ngày hết hạn thẻ
                </label>
                <input
                  type="date"
                  className="w-full h-9 px-3 bg-surface-container-low rounded-sm"
                  value={formData.cardExpiresAt}
                  onChange={(e) =>
                    setFormData({ ...formData, cardExpiresAt: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Email</label>
                <input
                  type="email"
                  className="w-full h-9 px-3 bg-surface-container-low rounded-sm"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  Số điện thoại độc giả
                </label>
                <input
                  className="w-full h-9 px-3 bg-surface-container-low rounded-sm"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  Họ tên phụ huynh
                </label>
                <input
                  className="w-full h-9 px-3 bg-surface-container-low rounded-sm"
                  value={formData.parentName}
                  onChange={(e) =>
                    setFormData({ ...formData, parentName: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  SĐT phụ huynh
                </label>
                <input
                  className="w-full h-9 px-3 bg-surface-container-low rounded-sm"
                  value={formData.parentPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, parentPhone: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-surface-container">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="h-9 px-4 bg-surface-container-low hover:bg-surface-container rounded-sm cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="h-9 px-4 bg-primary-container hover:bg-primary text-on-primary rounded-sm cursor-pointer"
              >
                {editingPatron ? "Lưu thay đổi" : "Tạo độc giả"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
