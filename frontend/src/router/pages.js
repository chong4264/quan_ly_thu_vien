import BaoCaoThongKe from '../pages/admin/BaoCaoThongKe';
import CauHinhHeThong from '../pages/admin/CauHinhHeThong';
import ChiTietSach from '../pages/reader/ChiTietSach';
import DashboardTongQuan from '../pages/admin/DashboardTongQuan';
import HoSoCaNhan from '../pages/reader/HoSoCaNhan';
import LichSuMuon from '../pages/reader/LichSuMuon';
import QuanLyBanSao from '../pages/admin/QuanLyBanSao';
import QuanLyDocGia from '../pages/admin/QuanLyDocGia';
import PhieuMuonTra from '../pages/admin/PhieuMuonTra';
import QuanLyTheLoai from '../pages/admin/QuanLyTheLoai';
import QuanLyDauSach from '../pages/admin/QuanLyDauSach';
import QuayMuonSach from '../pages/admin/QuayMuonSach';
import QuayTraGiaHan from '../pages/admin/QuayTraGiaHan';
import SachDangMuon from '../pages/reader/SachDangMuon';
import ThemMoiSuaSach from '../pages/admin/ThemMoiSuaSach';
import TraCuuSach from '../pages/reader/TraCuuSach';

export const adminRoutes = [["bao-cao-thong-ke",BaoCaoThongKe],["cau-hinh-he-thong",CauHinhHeThong],["dashboard-tong-quan",DashboardTongQuan],["quan-ly-ban-sao",QuanLyBanSao],["quan-ly-doc-gia",QuanLyDocGia],["phieu-muon-tra",PhieuMuonTra],["quan-ly-the-loai",QuanLyTheLoai],["quan-ly-dau-sach",QuanLyDauSach],["quay-muon-sach",QuayMuonSach],["quay-tra-gia-han",QuayTraGiaHan],["them-moi-sua-sach",ThemMoiSuaSach]];
export const readerRoutes = [["chi-tiet-sach",ChiTietSach],["ho-so-ca-nhan",HoSoCaNhan],["lich-su-muon",LichSuMuon],["sach-dang-muon",SachDangMuon],["tra-cuu-sach",TraCuuSach]];
