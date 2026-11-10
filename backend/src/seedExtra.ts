import type { Core } from "@strapi/strapi";

const UID = {
  shelf: "api::shelf.shelf",
  category: "api::category.category",
  patronType: "api::patron-type.patron-type",
  book: "api::book.book",
  copy: "api::copy.copy",
  patron: "api::patron.patron",
  loan: "api::loan.loan",
  loanItem: "api::loan-item.loan-item",
  returnReceipt: "api::return-receipt.return-receipt",
  setting: "api::library-setting.library-setting",
} as const;

// ---- Hàm tiện ích ngày giờ (dữ liệu luôn tương đối so với hôm nay) ----
const daysFromNow = (n: number) => new Date(Date.now() + n * 86400000);
const iso = (n: number) => daysFromNow(n).toISOString();
const dateOnly = (n: number) => daysFromNow(n).toISOString().slice(0, 10);

export async function seedExtra(strapi: Core.Strapi) {
  const docs = (uid: string) => strapi.documents(uid as any) as any;
  const isEmpty = async (uid: string) =>
    (await docs(uid).findMany({ limit: 1 })).length === 0;
  const create = async (uid: string, data: Record<string, any>) =>
    docs(uid).create({ data });

  try {
    console.log("🌱 Đang khởi tạo dữ liệu mẫu cho các bảng còn lại...");

    // ───────────── 1. SHELF (5) ─────────────
    if (await isEmpty(UID.shelf)) {
      const shelves = [
        {
          code: "VH-01",
          zone: "Khu A",
          floor: "Tầng 1",
          description: "Kệ văn học Việt Nam",
        },
        {
          code: "VH-02",
          zone: "Khu A",
          floor: "Tầng 1",
          description: "Kệ văn học nước ngoài",
        },
        {
          code: "CN-01",
          zone: "Khu B",
          floor: "Tầng 2",
          description: "Kệ công nghệ thông tin",
        },
        {
          code: "TL-01",
          zone: "Khu C",
          floor: "Tầng 2",
          description: "Kệ tâm lý và kỹ năng sống",
        },
        {
          code: "TK-01",
          zone: "Khu D",
          floor: "Tầng 1",
          description: "Kệ sách tham khảo, từ điển",
        },
      ];
      for (const s of shelves) await create(UID.shelf, s);
      console.log("✅ Đã tạo 5 kệ sách");
    }
    const shelfList = await docs(UID.shelf).findMany({ limit: 100 });
    const shelfId = (code: string) =>
      shelfList.find((s: any) => s.code === code)?.documentId;

    // Gắn kệ cho danh mục và đầu sách đã seed ở index.ts (nếu chưa có)
    const catShelf: Record<string, string> = {
      CAT001: "VH-01",
      CAT002: "CN-01",
      CAT003: "TL-01",
    };
    const cats = await docs(UID.category).findMany({
      populate: ["shelf"],
      limit: 100,
    });
    for (const c of cats) {
      const sid = shelfId(catShelf[c.code]);
      if (!sid || c.shelf) continue;
      await docs(UID.category).update({
        documentId: c.documentId,
        data: { shelf: sid },
      });
      const books = await docs(UID.book).findMany({
        filters: { category: { documentId: c.documentId } },
        limit: 100,
      });
      for (const b of books) {
        await docs(UID.book).update({
          documentId: b.documentId,
          data: { shelf: sid },
        });
      }
    }

    // ───────────── 2. PATRON-TYPE (4) ─────────────
    if (await isEmpty(UID.patronType)) {
      const types = [
        {
          name: "Học sinh Khối 10",
          maxBooks: 3,
          loanDays: 14,
          maxRenewals: 1,
          renewDays: 7,
        },
        {
          name: "Học sinh Khối 11",
          maxBooks: 4,
          loanDays: 14,
          maxRenewals: 2,
          renewDays: 7,
        },
        {
          name: "Học sinh Khối 12",
          maxBooks: 5,
          loanDays: 21,
          maxRenewals: 2,
          renewDays: 7,
        },
        {
          name: "Giáo viên",
          maxBooks: 10,
          loanDays: 30,
          maxRenewals: 3,
          renewDays: 14,
        },
      ];
      for (const t of types) await create(UID.patronType, t);
      console.log("✅ Đã tạo 4 đối tượng độc giả");
    }
    const typeList = await docs(UID.patronType).findMany({ limit: 100 });
    const typeId = (name: string) =>
      typeList.find((t: any) => t.name === name)?.documentId;

    // ───────────── 3. COPY (5) – trỏ tới sách đã seed ở index.ts ─────────────
    const findBook = async (isbn: string) =>
      (
        await docs(UID.book).findMany({
          filters: { isbn: { $eq: isbn } },
          limit: 1,
        })
      )[0];

    if (await isEmpty(UID.copy)) {
      const copies = [
        {
          isbn: "9786045678901",
          accessionNo: "DKCB-0001",
          barcode: "8930000000011",
          condition: "good",
          circulationStatus: "borrowed",
          shelf: "VH-01",
        },
        {
          isbn: "9786045678902",
          accessionNo: "DKCB-0002",
          barcode: "8930000000028",
          condition: "good",
          circulationStatus: "available",
          shelf: "VH-01",
        },
        {
          isbn: "9780132350884",
          accessionNo: "DKCB-0003",
          barcode: "8930000000035",
          condition: "new",
          circulationStatus: "borrowed",
          shelf: "CN-01",
        },
        {
          isbn: "9786045812345",
          accessionNo: "DKCB-0004",
          barcode: "8930000000042",
          condition: "worn",
          circulationStatus: "available",
          shelf: "TL-01",
        },
        {
          isbn: "9786045834567",
          accessionNo: "DKCB-0005",
          barcode: "8930000000059",
          condition: "damaged",
          circulationStatus: "processing",
          shelf: "TL-01",
        },
      ];
      for (const c of copies) {
        const book = await findBook(c.isbn);
        if (!book) {
          console.warn(
            `⚠️ Không thấy sách ISBN ${c.isbn}, bỏ qua bản sao ${c.accessionNo}`,
          );
          continue;
        }
        const { isbn, shelf, ...rest } = c;
        await create(UID.copy, {
          ...rest,
          importedAt: dateOnly(-120),
          book: book.documentId,
          shelf: shelfId(shelf),
        });
      }
      console.log("✅ Đã tạo 5 bản sao");
    }

    // ───────────── 4. PATRON (5) ─────────────
    if (await isEmpty(UID.patron)) {
      const patrons = [
        {
          studentCode: "HS2024001",
          fullName: "Nguyễn Minh Anh",
          className: "10A1",
          cardBarcode: "CARD-0001",
          email: "minhanh@truonghoc.edu.vn",
          phone: "0901000001",
          parentName: "Nguyễn Văn Hùng",
          parentPhone: "0912000001",
          homeroomTeacher: "Cô Lê Thị Hoa",
          address: "12 Phố Huế, Hai Bà Trưng, Hà Nội",
          cardStatus: "active",
          cardExpiresAt: dateOnly(300),
          type: "Học sinh Khối 10",
        },
        {
          studentCode: "HS2023014",
          fullName: "Trần Quốc Bảo",
          className: "11B2",
          cardBarcode: "CARD-0002",
          email: "quocbao@truonghoc.edu.vn",
          phone: "0901000002",
          parentName: "Trần Thị Lan",
          parentPhone: "0912000002",
          homeroomTeacher: "Thầy Phạm Văn Nam",
          address: "45 Kim Mã, Ba Đình, Hà Nội",
          cardStatus: "active",
          cardExpiresAt: dateOnly(200),
          type: "Học sinh Khối 11",
        },
        {
          studentCode: "HS2022007",
          fullName: "Lê Thu Hà",
          className: "12C1",
          cardBarcode: "CARD-0003",
          email: "thuha@truonghoc.edu.vn",
          phone: "0901000003",
          parentName: "Lê Văn Đức",
          parentPhone: "0912000003",
          homeroomTeacher: "Cô Vũ Thị Mai",
          address: "8 Láng Hạ, Đống Đa, Hà Nội",
          cardStatus: "warning",
          cardExpiresAt: dateOnly(120),
          type: "Học sinh Khối 12",
        },
        {
          studentCode: "HS2022031",
          fullName: "Phạm Gia Huy",
          className: "12A3",
          cardBarcode: "CARD-0004",
          email: "giahuy@truonghoc.edu.vn",
          phone: "0901000004",
          parentName: "Phạm Thị Ngọc",
          parentPhone: "0912000004",
          homeroomTeacher: "Thầy Đỗ Minh Tuấn",
          address: "21 Nguyễn Trãi, Thanh Xuân, Hà Nội",
          cardStatus: "locked",
          cardExpiresAt: dateOnly(60),
          type: "Học sinh Khối 12",
        },
        {
          studentCode: "GV001",
          fullName: "Hoàng Thị Lan",
          className: "Tổ Ngữ văn",
          cardBarcode: "CARD-0005",
          email: "lanht@truonghoc.edu.vn",
          phone: "0901000005",
          parentName: "",
          parentPhone: "",
          homeroomTeacher: "",
          address: "99 Cầu Giấy, Hà Nội",
          cardStatus: "active",
          cardExpiresAt: dateOnly(365),
          type: "Giáo viên",
        },
      ];
      for (const p of patrons) {
        const { type, ...rest } = p;
        await create(UID.patron, { ...rest, patronType: typeId(type) });
      }
      console.log("✅ Đã tạo 5 độc giả");
    }
    const patronList = await docs(UID.patron).findMany({ limit: 100 });
    const patronId = (code: string) =>
      patronList.find((p: any) => p.studentCode === code)?.documentId;

    // ───────────── 5. LIBRARY-SETTING (single type) ─────────────
    if (!(await docs(UID.setting).findFirst())) {
      await create(UID.setting, {
        finePerDay: 1000,
        damageCompensationRate: 20,
        lostCompensationRate: 100,
        autoLockAfterDays: 30,
        remindBeforeDays: 2,
        overdueRemindEvery: "daily",
      });
      console.log("✅ Đã tạo cấu hình hệ thống");
    }

    // ───────────── 6. LOAN (4) + LOAN-ITEM (5) + RETURN-RECEIPT (3) ─────────────
    if (await isEmpty(UID.loan)) {
      // Thủ thư (user của Users & Permissions) – mật khẩu demo: Thuthu@123
      let librarianId: string | undefined;
      try {
        const userQuery = strapi.db.query("plugin::users-permissions.user");
        let librarian: any = await userQuery.findOne({
          where: { email: "thuthu@truonghoc.edu.vn" },
        });
        if (!librarian) {
          const role: any = await strapi.db
            .query("plugin::users-permissions.role")
            .findOne({ where: { type: "authenticated" } });
          librarian = await strapi
            .plugin("users-permissions")
            .service("user")
            .add({
              username: "thuthu",
              email: "thuthu@truonghoc.edu.vn",
              password: "admin123",
              provider: "local",
              confirmed: true,
              blocked: false,
              role: role?.id,
            });
        }
        librarianId = librarian?.documentId;
      } catch (e: any) {
        console.warn("⚠️ Không tạo được tài khoản thủ thư mẫu:", e.message);
      }
      const lib = librarianId ? { librarian: librarianId } : {};

      const copyId = async (accessionNo: string) =>
        (
          await docs(UID.copy).findMany({
            filters: { accessionNo: { $eq: accessionNo } },
            limit: 1,
          })
        )[0]?.documentId;

      // 4 phiếu mượn
      const loanA = await create(UID.loan, {
        code: "PM-0001",
        loanedAt: iso(-5),
        status: "borrowing",
        note: "",
        patron: patronId("HS2024001"),
        ...lib,
      });
      const loanB = await create(UID.loan, {
        code: "PM-0002",
        loanedAt: iso(-20),
        status: "returned",
        note: "",
        patron: patronId("HS2023014"),
        ...lib,
      });
      const loanC = await create(UID.loan, {
        code: "PM-0003",
        loanedAt: iso(-25),
        status: "overdue",
        note: "Đã nhắc qua email",
        patron: patronId("HS2022007"),
        ...lib,
      });
      const loanD = await create(UID.loan, {
        code: "PM-0004",
        loanedAt: iso(-30),
        status: "returned",
        note: "Trả muộn, đã thu phạt",
        patron: patronId("GV001"),
        ...lib,
      });

      // 5 dòng sách trong phiếu
      const item0 = await create(UID.loanItem, {
        dueDate: dateOnly(9),
        renewCount: 0,
        lateDays: 0,
        fine: 0,
        fineCollected: false,
        status: "borrowing",
        loan: loanA.documentId,
        copy: await copyId("DKCB-0001"),
      });
      const item1 = await create(UID.loanItem, {
        dueDate: dateOnly(-6),
        returnedAt: iso(-8),
        renewCount: 0,
        returnCondition: "normal",
        lateDays: 0,
        fine: 0,
        fineCollected: false,
        status: "returned",
        loan: loanB.documentId,
        copy: await copyId("DKCB-0002"),
      });
      await create(UID.loanItem, {
        dueDate: dateOnly(-11),
        renewCount: 1,
        lateDays: 11,
        fine: 11000,
        fineCollected: false,
        status: "overdue",
        loan: loanC.documentId,
        copy: await copyId("DKCB-0003"),
      });
      const item3 = await create(UID.loanItem, {
        dueDate: dateOnly(-16),
        returnedAt: iso(-11),
        renewCount: 0,
        returnCondition: "scratched",
        lateDays: 5,
        fine: 5000,
        fineCollected: true,
        status: "returned",
        loan: loanD.documentId,
        copy: await copyId("DKCB-0004"),
      });
      const item4 = await create(UID.loanItem, {
        dueDate: dateOnly(-16),
        returnedAt: iso(-11),
        renewCount: 0,
        returnCondition: "damaged",
        lateDays: 5,
        fine: 25000,
        fineCollected: true,
        status: "returned",
        loan: loanD.documentId,
        copy: await copyId("DKCB-0005"),
      });
      void item0;

      // 3 phiếu trả (cho các dòng đã trả)
      await create(UID.returnReceipt, {
        code: "PT-0001",
        returnedAt: iso(-8),
        note: "Sách nguyên vẹn",
        loanItem: item1.documentId,
        ...lib,
      });
      await create(UID.returnReceipt, {
        code: "PT-0002",
        returnedAt: iso(-11),
        note: "Trầy bìa nhẹ, phạt trả muộn 5 ngày",
        loanItem: item3.documentId,
        ...lib,
      });
      await create(UID.returnReceipt, {
        code: "PT-0003",
        returnedAt: iso(-11),
        note: "Rách trang, phạt trả muộn và bồi thường 20%",
        loanItem: item4.documentId,
        ...lib,
      });

      console.log("✅ Đã tạo 4 phiếu mượn, 5 dòng sách, 3 phiếu trả");
    }

    console.log("🎉 Hoàn tất dữ liệu mẫu cho tất cả các bảng!");
  } catch (err: any) {
    console.error(
      "❌ Lỗi khi nạp dữ liệu mẫu (seedExtra):",
      err.message || err,
    );
  }
}
