# Hướng dẫn cách chạy test local

# Cài dependencies
npm install

# Chạy test toàn bộ
npm test

# Chạy test + Coverage (bắt buộc để gửi lên SonarCloud)
npm test -- --coverage

# Để xem báo cáo ở dạng web local chạy
npx serve coverage
