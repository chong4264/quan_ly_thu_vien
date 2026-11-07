import type { Core } from '@strapi/strapi';
import mysql from 'mysql2/promise';

export default {
  async register({ strapi }: { strapi: Core.Strapi }) {
    if (process.env.DATABASE_CLIENT === 'mysql') {
      const host = process.env.DATABASE_HOST || '127.0.0.1';
      const port = Number(process.env.DATABASE_PORT) || 3306;
      const user = process.env.DATABASE_USERNAME || 'root';
      const password = process.env.DATABASE_PASSWORD || '';
      const database = process.env.DATABASE_NAME || 'quan_ly_thu_vien';

      try {
        const connection = await mysql.createConnection({ host, port, user, password });
        await connection.query(
          `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
        );
        await connection.end();
        console.log(`[Database Init] Đã kiểm tra/khởi tạo Database '${database}' thành công.`);
      } catch (error: any) {
        console.error('[Database Init Error]:', error.message);
      }
    }
  },

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    try {
      // Lấy danh sách UID chuẩn từ Strapi
      const categoryUid = 'api::category.category';
      const bookUid = 'api::book.book';

      // Kiểm tra xem đã có category nào chưa
      const categories = await strapi.documents(categoryUid).findMany();

      if (categories.length === 0) {
        console.log('🌱 Đang khởi tạo dữ liệu mẫu (3 Categories x 5 Books)...');

        const seedData = [
          {
            category: {
              name: 'Văn học',
              description: 'Các tác phẩm văn học kinh điển trong và ngoài nước',
            },
            books: [
              { title: 'Số Đỏ', isbn: '9786045678901', author: 'Vũ Trọng Phụng', publishedYear: 1936, totalCopies: 10, availableCopies: 10, description: 'Tiểu thuyết trào phúng nổi tiếng.' },
              { title: 'Tắt Đèn', isbn: '9786045678902', author: 'Ngô Tất Tố', publishedYear: 1939, totalCopies: 8, availableCopies: 8, description: 'Tác phẩm hiện thực xuất sắc.' },
              { title: 'Lão Hạc', isbn: '9786045678903', author: 'Nam Cao', publishedYear: 1943, totalCopies: 12, availableCopies: 12, description: 'Truyện ngắn cảm động.' },
              { title: 'Truyện Kiều', isbn: '9786045678904', author: 'Nguyễn Du', publishedYear: 1820, totalCopies: 15, availableCopies: 15, description: 'Kiệt tác văn học Việt Nam.' },
              { title: 'Dế Mèn Phiêu Lưu Ký', isbn: '9786045678905', author: 'Tô Hoài', publishedYear: 1941, totalCopies: 20, availableCopies: 20, description: 'Truyện thiếu nhi kinh điển.' },
            ],
          },
          {
            category: {
              name: 'Công nghệ thông tin',
              description: 'Sách chuyên ngành lập trình và phần mềm',
            },
            books: [
              { title: 'Clean Code', isbn: '9780132350884', author: 'Robert C. Martin', publishedYear: 2008, totalCopies: 5, availableCopies: 5, description: 'Hướng dẫn viết mã sạch.' },
              { title: 'Design Patterns', isbn: '9780201633610', author: 'Erich Gamma', publishedYear: 1994, totalCopies: 4, availableCopies: 4, description: '23 mẫu thiết kế phần mềm.' },
              { title: 'You Don\'t Know JS Yet', isbn: '9781491904244', author: 'Kyle Simpson', publishedYear: 2020, totalCopies: 8, availableCopies: 8, description: 'Tìm hiểu sâu về JavaScript.' },
              { title: 'The Pragmatic Programmer', isbn: '9780135957059', author: 'Andrew Hunt', publishedYear: 2019, totalCopies: 6, availableCopies: 6, description: 'Tư duy lập trình chuyên nghiệp.' },
              { title: 'Refactoring', isbn: '9780134757599', author: 'Martin Fowler', publishedYear: 2018, totalCopies: 5, availableCopies: 5, description: 'Cải thiện thiết kế mã nguồn.' },
            ],
          },
          {
            category: {
              name: 'Tâm lý & Kỹ năng sống',
              description: 'Sách phát triển bản thân và tâm lý học',
            },
            books: [
              { title: 'Đắc Nhân Tâm', isbn: '9786045812345', author: 'Dale Carnegie', publishedYear: 1936, totalCopies: 15, availableCopies: 15, description: 'Nghệ thuật thu phục lòng người.' },
              { title: 'Tư Duy Nhanh Và Chậm', isbn: '9786045823456', author: 'Daniel Kahneman', publishedYear: 2011, totalCopies: 7, availableCopies: 7, description: 'Hai hệ thống tư duy.' },
              { title: 'Thói Quen Nguyên Tử', isbn: '9786045834567', author: 'James Clear', publishedYear: 2018, totalCopies: 10, availableCopies: 10, description: 'Thay đổi nhỏ tạo nên kết quả lớn.' },
              { title: 'Đi Tìm Lẽ Sống', isbn: '9786045845678', author: 'Viktor E. Frankl', publishedYear: 1946, totalCopies: 6, availableCopies: 6, description: 'Ý nghĩa cuộc sống.' },
              { title: 'Quẳng Gánh Lo Đi Và Vui Sống', isbn: '9786045856789', author: 'Dale Carnegie', publishedYear: 1948, totalCopies: 9, availableCopies: 9, description: 'Phương pháp giải tỏa lo âu.' },
            ],
          },
        ];

        for (const item of seedData) {
          // 1. Tạo Category và Publish
          const createdCategory = await strapi.documents(categoryUid).create({
            data: item.category,
            status: 'published',
          });

          // 2. Tạo 5 Books thuộc Category này và Publish
          for (const book of item.books) {
            await strapi.documents(bookUid).create({
              data: {
                ...book,
                categories: [createdCategory.documentId],
              },
              status: 'published',
            },);
          }
        }

        console.log('✅ Đã nạp thành công 3 Categories và 15 Books!');
      }
    } catch (err: any) {
      console.error('Lỗi khi nạp dữ liệu mẫu:', err.message || err);
    }
  },
};