import type { Core } from "@strapi/strapi";
import mysql from "mysql2/promise";
import { seedExtra } from "./seedExtra";
import { ensureLibrarianRole, ensureReaderPermissions, registerBookManagement } from "./utils/book-management";

export default {
  async register({ strapi }: { strapi: Core.Strapi }) {
    registerBookManagement(strapi);
    if (process.env.DATABASE_CLIENT === "mysql") {
      const host = process.env.DATABASE_HOST || "127.0.0.1";
      const port = Number(process.env.DATABASE_PORT) || 3306;
      const user = process.env.DATABASE_USERNAME || "root";
      const password = process.env.DATABASE_PASSWORD || "";
      const database = process.env.DATABASE_NAME || "quan_ly_thu_vien";

      try {
        const connection = await mysql.createConnection({
          host,
          port,
          user,
          password,
        });
        await connection.query(
          `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
        );
        await connection.end();
        console.log(
          `[Database Init] Đã kiểm tra/khởi tạo Database '${database}' thành công.`,
        );
      } catch (error: any) {
        console.error("[Database Init Error]:", error.message);
      }
    }
  },

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    try {
      const categoryUid = "api::category.category";
      const bookUid = "api::book.book";

      // Chỉ khởi tạo dữ liệu khi chưa có danh mục
      const categories = await strapi.documents(categoryUid).findMany();

      if (categories.length > 0) {
        console.log("📚 Dữ liệu danh mục đã tồn tại, bỏ qua seed.");
        await seedExtra(strapi);
        return;
      }

      console.log("🌱 Đang khởi tạo 3 danh mục và 15 đầu sách...");

      // 1. Định nghĩa Type chuẩn cho seedData
      type CategoryStatus = "active" | "inactive";
      type BookLanguage = "vie" | "eng" | "fra" | "zho" | "rus";

      interface SeedCategory {
        code: string;
        ddcCode: string;
        name: string;
        ddcClass: string;
        note: string;
        status: CategoryStatus;
      }

      interface SeedBook {
        isbn: string;
        title: string;
        author: string;
        coAuthors?: string;
        publisher: string;
        publishYear: number;
        language: BookLanguage;
        pages: number;
        edition: number;
        price: number;
        abstract: string;
        tags: string[];
        ddcMain: string;
        callNumber: string;
      }

      interface SeedItem {
        category: SeedCategory;
        books: SeedBook[];
      }

      const seedData: SeedItem[] = [
        {
          category: {
            code: "CAT001",
            ddcCode: "800",
            name: "Văn học",
            ddcClass: "Văn học và tu từ học",
            note: "Các tác phẩm văn học kinh điển trong và ngoài nước",
            status: "active",
          },
          books: [
            {
              isbn: "9786045678901",
              title: "Số Đỏ",
              author: "Vũ Trọng Phụng",
              publisher: "NXB Văn Học",
              publishYear: 1936,
              language: "vie",
              pages: 256,
              edition: 1,
              price: 85000,
              abstract:
                "Tiểu thuyết trào phúng nổi tiếng phản ánh xã hội Việt Nam thời kỳ trước Cách mạng.",
              tags: ["Văn học Việt Nam", "Tiểu thuyết", "Trào phúng"],
              ddcMain: "895.9223",
              callNumber: "895.9223 VUT",
            },
            {
              isbn: "9786045678902",
              title: "Tắt Đèn",
              author: "Ngô Tất Tố",
              publisher: "NXB Văn Học",
              publishYear: 1939,
              language: "vie",
              pages: 220,
              edition: 1,
              price: 75000,
              abstract:
                "Tác phẩm hiện thực phản ánh cuộc sống khổ cực của người nông dân Việt Nam.",
              tags: ["Văn học Việt Nam", "Hiện thực", "Tiểu thuyết"],
              ddcMain: "895.9223",
              callNumber: "895.9223 NGO",
            },
            {
              isbn: "9786045678903",
              title: "Lão Hạc",
              author: "Nam Cao",
              publisher: "NXB Kim Đồng",
              publishYear: 1943,
              language: "vie",
              pages: 180,
              edition: 1,
              price: 65000,
              abstract:
                "Truyện ngắn về số phận người nông dân nghèo và tình phụ tử.",
              tags: ["Truyện ngắn", "Văn học Việt Nam"],
              ddcMain: "895.9223",
              callNumber: "895.9223 NAM",
            },
            {
              isbn: "9786045678904",
              title: "Truyện Kiều",
              author: "Nguyễn Du",
              publisher: "NXB Văn Học",
              publishYear: 1820,
              language: "vie",
              pages: 320,
              edition: 1,
              price: 120000,
              abstract: "Kiệt tác truyện thơ Nôm của đại thi hào Nguyễn Du.",
              tags: ["Thơ Nôm", "Văn học cổ điển", "Kiệt tác"],
              ddcMain: "895.9221",
              callNumber: "895.9221 NGU",
            },
            {
              isbn: "9786045678905",
              title: "Dế Mèn Phiêu Lưu Ký",
              author: "Tô Hoài",
              publisher: "NXB Kim Đồng",
              publishYear: 1941,
              language: "vie",
              pages: 220,
              edition: 1,
              price: 90000,
              abstract:
                "Câu chuyện phiêu lưu của chú Dế Mèn qua thế giới loài vật.",
              tags: ["Thiếu nhi", "Phiêu lưu", "Văn học Việt Nam"],
              ddcMain: "895.9223",
              callNumber: "895.9223 TOH",
            },
          ],
        },

        {
          category: {
            code: "CAT002",
            ddcCode: "004",
            name: "Công nghệ thông tin",
            ddcClass: "Khoa học máy tính và công nghệ thông tin",
            note: "Sách chuyên ngành lập trình, phần mềm và khoa học máy tính",
            status: "active",
          },
          books: [
            {
              isbn: "9780132350884",
              title: "Clean Code",
              author: "Robert C. Martin",
              publisher: "Prentice Hall",
              publishYear: 2008,
              language: "eng",
              pages: 464,
              edition: 1,
              price: 450000,
              abstract:
                "Hướng dẫn các nguyên tắc viết mã nguồn sạch, dễ đọc và dễ bảo trì.",
              tags: ["Programming", "Clean Code", "Software Engineering"],
              ddcMain: "005.1",
              callNumber: "005.1 MAR",
            },
            {
              isbn: "9780201633610",
              title: "Design Patterns",
              author: "Erich Gamma",
              coAuthors: "Richard Helm, Ralph Johnson, John Vlissides",
              publisher: "Addison-Wesley",
              publishYear: 1994,
              language: "eng",
              pages: 395,
              edition: 1,
              price: 520000,
              abstract: "Giới thiệu 23 mẫu thiết kế phần mềm hướng đối tượng.",
              tags: ["Design Patterns", "OOP", "Software Engineering"],
              ddcMain: "005.1",
              callNumber: "005.1 GAM",
            },
            {
              isbn: "9781491904244",
              title: "You Don’t Know JS Yet",
              author: "Kyle Simpson",
              publisher: "O’Reilly Media",
              publishYear: 2020,
              language: "eng",
              pages: 143,
              edition: 2,
              price: 380000,
              abstract:
                "Tìm hiểu chuyên sâu về JavaScript và cách ngôn ngữ này vận hành.",
              tags: ["JavaScript", "Web Development", "Programming"],
              ddcMain: "005.133",
              callNumber: "005.133 SIM",
            },
            {
              isbn: "9780135957059",
              title: "The Pragmatic Programmer",
              author: "Andrew Hunt",
              coAuthors: "David Thomas",
              publisher: "Addison-Wesley",
              publishYear: 2019,
              language: "eng",
              pages: 352,
              edition: 2,
              price: 490000,
              abstract:
                "Chia sẻ kinh nghiệm và tư duy phát triển phần mềm chuyên nghiệp.",
              tags: ["Programming", "Software Development", "Career"],
              ddcMain: "005.1",
              callNumber: "005.1 HUN",
            },
            {
              isbn: "9780134757599",
              title: "Refactoring",
              author: "Martin Fowler",
              publisher: "Addison-Wesley",
              publishYear: 2018,
              language: "eng",
              pages: 448,
              edition: 2,
              price: 510000,
              abstract:
                "Hướng dẫn cải thiện cấu trúc mã nguồn mà không làm thay đổi hành vi bên ngoài.",
              tags: ["Refactoring", "Programming", "Clean Code"],
              ddcMain: "005.1",
              callNumber: "005.1 FOW",
            },
          ],
        },

        {
          category: {
            code: "CAT003",
            ddcCode: "150",
            name: "Tâm lý và kỹ năng sống",
            ddcClass: "Tâm lý học",
            note: "Sách phát triển bản thân, tâm lý học và kỹ năng sống",
            status: "active",
          },
          books: [
            {
              isbn: "9786045812345",
              title: "Đắc Nhân Tâm",
              author: "Dale Carnegie",
              publisher: "NXB Tổng hợp TP.HCM",
              publishYear: 1936,
              language: "vie",
              pages: 320,
              edition: 1,
              price: 95000,
              abstract:
                "Những nguyên tắc giao tiếp và ứng xử nhằm xây dựng mối quan hệ tốt đẹp.",
              tags: ["Giao tiếp", "Phát triển bản thân", "Kỹ năng sống"],
              ddcMain: "158.1",
              callNumber: "158.1 CAR",
            },
            {
              isbn: "9786045823456",
              title: "Tư Duy Nhanh Và Chậm",
              author: "Daniel Kahneman",
              publisher: "NXB Thế Giới",
              publishYear: 2011,
              language: "vie",
              pages: 612,
              edition: 1,
              price: 180000,
              abstract:
                "Phân tích hai hệ thống tư duy ảnh hưởng đến quá trình ra quyết định của con người.",
              tags: ["Tâm lý học", "Tư duy", "Khoa học hành vi"],
              ddcMain: "153.4",
              callNumber: "153.4 KAH",
            },
            {
              isbn: "9786045834567",
              title: "Thói Quen Nguyên Tử",
              author: "James Clear",
              publisher: "NXB Thế Giới",
              publishYear: 2018,
              language: "vie",
              pages: 384,
              edition: 1,
              price: 120000,
              abstract:
                "Phương pháp xây dựng thói quen tốt và loại bỏ những thói quen xấu.",
              tags: ["Thói quen", "Phát triển bản thân", "Kỹ năng sống"],
              ddcMain: "158.1",
              callNumber: "158.1 CLE",
            },
            {
              isbn: "9786045845678",
              title: "Đi Tìm Lẽ Sống",
              author: "Viktor E. Frankl",
              publisher: "NXB Tổng hợp TP.HCM",
              publishYear: 1946,
              language: "vie",
              pages: 224,
              edition: 1,
              price: 85000,
              abstract:
                "Những suy ngẫm về ý nghĩa cuộc sống và khả năng vượt qua nghịch cảnh.",
              tags: ["Tâm lý học", "Ý nghĩa cuộc sống", "Triết học"],
              ddcMain: "150",
              callNumber: "150 FRA",
            },
            {
              isbn: "9786045856789",
              title: "Quẳng Gánh Lo Đi Và Vui Sống",
              author: "Dale Carnegie",
              publisher: "NXB Tổng hợp TP.HCM",
              publishYear: 1948,
              language: "vie",
              pages: 320,
              edition: 1,
              price: 99000,
              abstract:
                "Các phương pháp thực tế giúp kiểm soát lo âu và cải thiện chất lượng cuộc sống.",
              tags: ["Tâm lý học", "Kỹ năng sống", "Quản lý cảm xúc"],
              ddcMain: "158.1",
              callNumber: "158.1 CAR",
            },
          ],
        },
      ];

      // Tạo từng danh mục và các đầu sách thuộc danh mục đó
      for (const item of seedData) {
        const createdCategory = await strapi.documents(categoryUid).create({
          data: item.category,
        });

        for (const book of item.books) {
          await strapi.documents(bookUid).create({
            data: {
              ...book,
              status: "active",
              allowHomeLoan: true,
              referenceOnly: false,
              priorityGifted: false,

              // Strapi v5 Document Service API: Truyền trực tiếp documentId
              category: createdCategory.documentId,
            },
          });
        }

        console.log(`✅ Đã tạo danh mục: ${item.category.name}`);
      }

      console.log("🎉 Hoàn tất: 3 danh mục và 15 đầu sách!");
      await seedExtra(strapi);
    } catch (err: any) {
      console.error("❌ Lỗi khi nạp dữ liệu mẫu:", err.message || err);
    } finally {
      await ensureLibrarianRole(strapi);
      await ensureReaderPermissions(strapi);
    }
  },
};
