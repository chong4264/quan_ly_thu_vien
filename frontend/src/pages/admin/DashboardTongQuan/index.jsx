import { useState, useEffect, useCallback } from "react";
import { useToast } from "../../../context/ToastContext";
import BangDieuKhienThu from "./BangDieuKhienThu";
import Section2 from "./Section2";
import XuHuongMuonTra from "./XuHuongMuonTra";
import GiaoDichLuuThong from "./GiaoDichLuuThong";
import Section5 from "./Section5";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:1337/api";

export default function DashboardTongQuanPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [trend, setTrend] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [recentLoans, setRecentLoans] = useState([]);
  const [dueSoon, setDueSoon] = useState([]);

  const getHeaders = () => {
    const token = localStorage.getItem("jwt") || sessionStorage.getItem("jwt");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchDashboardData = useCallback(
    async (isSync = false) => {
      setLoading(true);
      try {
        const headers = getHeaders();
        const [resOverview, resTrend, resCats, resRecent, resDueSoon] =
          await Promise.all([
            fetch(`${API_BASE}/stats/overview`, { headers }),
            fetch(`${API_BASE}/stats/trend?range=6m`, { headers }),
            fetch(`${API_BASE}/stats/top-categories?limit=5`, { headers }),
            fetch(`${API_BASE}/loans/recent?pageSize=10`, { headers }),
            fetch(`${API_BASE}/loan-items/due-soon?hours=48`, { headers }),
          ]);

        if (resOverview.ok) {
          const dataOverview = await resOverview.json();
          setOverview(dataOverview);
        }
        if (resTrend.ok) {
          const jsonTrend = await resTrend.json();
          setTrend(jsonTrend.data || []);
        }
        if (resCats.ok) {
          const jsonCats = await resCats.json();
          setTopCategories(jsonCats.data || []);
        }
        if (resRecent.ok) {
          const jsonRecent = await resRecent.json();
          setRecentLoans(jsonRecent.data || []);
        }
        if (resDueSoon.ok) {
          const jsonDueSoon = await resDueSoon.json();
          setDueSoon(jsonDueSoon.data || []);
        }

        if (isSync) {
          toast("Đồng bộ dữ liệu thống kê thành công!");
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu Dashboard:", error);
        toast("Không thể kết nối tới máy chủ thống kê");
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    fetchDashboardData(false);
  }, [fetchDashboardData]);

  const handleRemind = async (loanItemIds) => {
    if (!loanItemIds || loanItemIds.length === 0) return;
    try {
      const res = await fetch(`${API_BASE}/notifications/remind`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ loanItemIds }),
      });
      if (res.ok) {
        const result = await res.json();
        toast(
          `Đã gửi nhắc nhở cho ${result.sent ?? loanItemIds.length} lượt mượn`,
        );
      } else {
        toast("Gửi nhắc nhở thất bại");
      }
    } catch (error) {
      toast("Lỗi kết nối khi gửi thông báo nhắc nhở");
    }
  };

  return (
    <main className="relative pt-16 bg-surface min-h-screen">
      <div className="w-full max-w-[1600px] mx-auto p-space-lg">
        <div className="flex flex-col w-full gap-space-lg">
          <BangDieuKhienThu
            onSync={() => fetchDashboardData(true)}
            loading={loading}
          />
          <Section2 overview={overview} loading={loading} />
          <XuHuongMuonTra
            trend={trend}
            topCategories={topCategories}
            overview={overview}
            loading={loading}
          />
          <GiaoDichLuuThong
            recentLoans={recentLoans}
            dueSoon={dueSoon}
            onRemind={handleRemind}
            loading={loading}
          />
          <Section5 />
        </div>
      </div>
    </main>
  );
}
