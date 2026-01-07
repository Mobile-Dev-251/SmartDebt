/**
 * Date utilities with Vietnam timezone (Asia/Ho_Chi_Minh)
 */

export const formatDateVN = (date: Date | string): string => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

export const formatDateTimeVN = (date: Date | string): string => {
  const dateObj = new Date(date);
  return dateObj.toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatTimeVN = (date: Date | string): string => {
  const dateObj = new Date(date);
  return dateObj.toLocaleTimeString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getCurrentDateVN = (): Date => {
  // Get current date in Vietnam timezone
  const now = new Date();
  const vnTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
  return vnTime;
};

export const isTodayVN = (date: Date | string): boolean => {
  const dateObj = new Date(date);
  const today = getCurrentDateVN();

  return dateObj.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) ===
         today.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
};

export const isThisMonthVN = (date: Date | string): boolean => {
  const dateObj = new Date(date);
  const today = getCurrentDateVN();

  const dateVN = dateObj.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  const todayVN = today.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

  return dateVN.split('/')[1] === todayVN.split('/')[1] &&
         dateVN.split('/')[2] === todayVN.split('/')[2];
};