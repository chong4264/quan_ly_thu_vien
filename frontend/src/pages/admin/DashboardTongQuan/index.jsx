import { useState, useEffect, useCallback } from "react";
import { useToast } from "../../../context/ToastContext";
import BangDieuKhienThu from "./BangDieuKhienThu";
import Section2 from "./Section2";
import XuHuongMuonTra from "./XuHuongMuonTra";
import GiaoDichLuuThong from "./GiaoDichLuuThong";
import Section5 from "./Section5";

const API_BASE = "http://localhost:1337/api";

const getHeaders = () => {
  const token = localStorage.getItem("jwt") || localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export default function DashboardTongQuanPage() {
  const toast = useToast();

  const [overview, setOverview] = useState({
    totalBooks: 0,
    totalCopies: 0,
    availableCopies: 0,
    borrowedCopies: 0,
    processingCopies: 0,
    lostCopies: 0,
    borrowingCount: 0,
    overdueCount: 0,
    activePatrons: 0,
  });

  const [trendData, setTrendData] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [recentLoans, setRecentLoans] = useState([]);
  const [dueSoonList, setDueSoonList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Hàm tải toàn bộ dữ liệu Dashboard từ Backend API stats
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [overviewRes, trendRes, topCatRes, recentRes, dueSoonRes] =
        await Promise.all([
          fetch(`${API_BASE}/stats/overview`, { headers: getHeaders() }),
          fetch(`${API_BASE}/stats/trend?range=6m`, { headers: getHeaders() }),
          fetch(`${API_BASE}/stats/top-categories?limit=5`, {
            headers: getHeaders(),
          }),
          fetch(`${API_BASE}/loans/recent?pageSize=10`, {
            headers: getHeaders(),
          }),
          fetch(`${API_BASE}/loan-items/due-soon?hours=48`, {
            headers: getHeaders(),
          }),
        ]);

      if (overviewRes.ok) {
        const data = await overviewRes.json();
        setOverview(data);
      }
      if (trendRes.ok) {
        const json = await trendRes.json();
        setTrendData(json.data || []);
      }
      if (topCatRes.ok) {
        const json = await topCatRes.json();
        setTopCategories(json.data || []);
      }
      if (recentRes.ok) {
        const json = await recentRes.json();
        setRecentLoans(json.data || []);
      }
      if (dueSoonRes.ok) {
        const json = await dueSoonRes.json();
        setDueSoonList(json.data || []);
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu dashboard:", err);
      toast("Không thể đồng bộ dữ liệu dashboard từ server");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Sử dụng queueMicrotask để gọi fetch an toàn không vi phạm set-state-in-effect
  useEffect(() => {
    let isMounted = true;
    queueMicrotask(() => {
      if (isMounted) {
        fetchDashboardData();
      }
    });
    return () => {
      isMounted = false;
    };
  }, [fetchDashboardData]);

  // Hàm nhắc nhở quá hạn từng người hoặc tất cả
  const handleRemind = async (loanItemIds = []) => {
    try {
      const res = await fetch(`${API_BASE}/notifications/remind`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ loanItemIds }),
      });
      if (!res.ok) throw new Error("Gửi nhắc nhở thất bại");
      toast("Đã gửi thông báo nhắc nhở thành công!");
      fetchDashboardData();
    } catch (err) {
      toast(err.message || "Lỗi gửi nhắc nhở");
    }
  };

  return (
    <main className="relative pt-16 bg-surface min-h-screen">
      <div className="w-full max-w-[1600px] mx-auto p-space-lg">
        <div className="flex flex-col w-full gap-space-lg">
          <BangDieuKhienThu onSync={fetchDashboardData} />
          <Section2 overview={overview} loading={loading} />
          <XuHuongMuonTra
            trendData={trendData}
            topCategories={topCategories}
            overview={overview}
          />
          <GiaoDichLuuThong
            recentLoans={recentLoans}
            dueSoonList={dueSoonList}
            onRemind={handleRemind}
          />
          <Section5 />
        </div>
      </div>
    </main>
  );
}
