# Hướng dẫn cách chạy test llocal

# Cài dependencies
npm install

# Chạy test toàn bôj
npm test

# Chạy test + Coverage (bắt buộc để gửi lên SonarCloud)
npm test -- --coverage

# Để xem báo cáo ở dạng web local chạy
npx serve coverage
