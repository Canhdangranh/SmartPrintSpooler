import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      // 1. Đảm bảo dòng base này chuẩn 100% với tên Repo (phân biệt hoa thường)
      base: '/SmartPrintSpooler/', 
      
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      
      // 2. PHẦN QUAN TRỌNG CẦN SỬA LÀ Ở ĐÂY
      define: {
        // Thêm dòng này để ngăn trình duyệt báo lỗi "process is not defined"
        'process.env': {}, 
        
        // Các dòng cũ giữ nguyên
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
