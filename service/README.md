# API Services Documentation

Tài liệu này mô tả cách sử dụng các service để gọi API từ backend.

## Cấu hình

### Base URL
API base URL được cấu hình trong `service/axios.js`. Mặc định sử dụng:
- Development: `http://[IP]:3000` (IP tự động detect từ Expo)
- Production: Có thể set qua biến môi trường `EXPO_PUBLIC_API_URL`

### Authentication
Token được tự động thêm vào header `Authorization: Bearer <token>` cho tất cả các request. Token được lưu trong AsyncStorage và tự động load khi app khởi động.

## Services

### Auth Service (`authService.js`)

#### `login(userData)`
Đăng nhập người dùng.

**Parameters:**
- `userData`: `{ email: string, password: string }`

**Returns:** Promise với response chứa `token` và `user`

**Example:**
```javascript
import { login } from '@/service/authService';
import { storage } from '@/utils/storage';

const response = await login({ email: 'user@example.com', password: 'password' });
if (response.token) {
  await storage.setToken(response.token);
}
```

#### `register(userData)`
Đăng ký người dùng mới.

**Parameters:**
- `userData`: `{ full_name: string, email: string, phone: string, password: string, avatar_url?: string }`

**Returns:** Promise với response

---

### User Service (`userService.js`)

#### `getMyProfile()`
Lấy thông tin người dùng hiện tại (yêu cầu token).

**Returns:** Promise với thông tin user

**Example:**
```javascript
import { getMyProfile } from '@/service/userService';

const profile = await getMyProfile();
console.log(profile);
```

#### `updatePushToken(token)`
Cập nhật push token cho người dùng (yêu cầu token).

**Parameters:**
- `token`: Expo push token string

**Returns:** Promise

---

### Debts Service (`debtsService.js`)

#### `getAllDebts()`
Lấy tất cả các khoản nợ/cho vay (yêu cầu token).

**Returns:** Promise với danh sách debts

#### `createDebt(debtData)`
Tạo khoản nợ mới (yêu cầu token).

**Parameters:**
- `debtData`: `{ borrower_id: number, type?: string, title?: string, amount: number, due_date: string, remind_before?: number, note?: string, isSaved?: boolean }`

**Returns:** Promise

#### `updateDebt(id, debtData)`
Cập nhật khoản nợ.

**Parameters:**
- `id`: ID của khoản nợ
- `debtData`: Dữ liệu cập nhật

**Returns:** Promise

#### `deleteDebt(id)`
Xóa khoản nợ.

**Parameters:**
- `id`: ID của khoản nợ

**Returns:** Promise

---

### Groups Service (`groupsService.js`)

#### `createNewGroup(groupData)`
Tạo nhóm mới (yêu cầu token).

**Parameters:**
- `groupData`: `{ name: string, members: number[] }`

**Returns:** Promise

#### `getMyGroups()`
Lấy danh sách nhóm của người dùng (yêu cầu token).

**Returns:** Promise với danh sách groups

#### `getGroupMembers(groupId)`
Lấy danh sách thành viên nhóm.

**Parameters:**
- `groupId`: ID của nhóm

**Returns:** Promise

#### `addMemberToGroup(groupId, data)`
Thêm thành viên vào nhóm.

**Parameters:**
- `groupId`: ID của nhóm
- `data`: `{ members: number[] }`

**Returns:** Promise

#### `createGroupExpense(groupId, expenseData)`
Tạo khoản chi cho nhóm (yêu cầu token).

**Parameters:**
- `groupId`: ID của nhóm
- `expenseData`: `{ totalAmount: number, due_date: string, remind_before?: number, description?: string, exceptMembers?: number[] }`

**Returns:** Promise

#### `leaveGroup(groupId)`
Rời khỏi nhóm (yêu cầu token).

**Parameters:**
- `groupId`: ID của nhóm

**Returns:** Promise

#### `getGroupHistoryExpenses(groupId)`
Lấy lịch sử chi tiêu nhóm.

**Parameters:**
- `groupId`: ID của nhóm

**Returns:** Promise

---

### Expenses Service (`expensesService.js`)

#### `getAllExpenses()`
Lấy tất cả chi phí.

**Returns:** Promise với danh sách expenses

#### `getExpenseById(id)`
Lấy chi phí theo ID.

**Parameters:**
- `id`: ID của chi phí

**Returns:** Promise

#### `createExpense(expenseData)`
Tạo chi phí mới.

**Parameters:**
- `expenseData`: `{ category_id: number, amount: number, description: string, date: string }`

**Returns:** Promise

#### `updateExpense(id, expenseData)`
Cập nhật chi phí.

**Parameters:**
- `id`: ID của chi phí
- `expenseData`: Dữ liệu cập nhật

**Returns:** Promise

#### `deleteExpense(id)`
Xóa chi phí.

**Parameters:**
- `id`: ID của chi phí

**Returns:** Promise

---

### Contacts Service (`contactsService.js`)

#### `getAllContacts()`
Lấy danh sách liên hệ (yêu cầu token).

**Returns:** Promise với danh sách contacts

#### `deleteContact(deleteId)`
Xóa liên hệ (yêu cầu token).

**Parameters:**
- `deleteId`: ID của liên hệ

**Returns:** Promise

---

### Categories Service (`categoriesService.js`)

#### `getAllCategories()`
Lấy tất cả danh mục.

**Returns:** Promise với danh sách categories

#### `getCategoryById(id)`
Lấy danh mục theo ID.

**Parameters:**
- `id`: ID của danh mục

**Returns:** Promise

#### `createCategory(categoryData)`
Tạo danh mục mới.

**Parameters:**
- `categoryData`: `{ name: string }`

**Returns:** Promise

#### `updateCategory(id, categoryData)`
Cập nhật danh mục.

**Parameters:**
- `id`: ID của danh mục
- `categoryData`: `{ name: string }`

**Returns:** Promise

#### `deleteCategory(id)`
Xóa danh mục.

**Parameters:**
- `id`: ID của danh mục

**Returns:** Promise

---

## Storage Utilities (`utils/storage.ts`)

### `storage.getToken()`
Lấy token từ AsyncStorage.

**Returns:** Promise<string | null>

### `storage.setToken(token)`
Lưu token vào AsyncStorage.

**Parameters:**
- `token`: Token string

**Returns:** Promise<void>

### `storage.removeToken()`
Xóa token khỏi AsyncStorage.

**Returns:** Promise<void>

### `storage.getUser()`
Lấy thông tin user từ AsyncStorage.

**Returns:** Promise<any | null>

### `storage.setUser(user)`
Lưu thông tin user vào AsyncStorage.

**Parameters:**
- `user`: User object

**Returns:** Promise<void>

### `storage.clearAll()`
Xóa tất cả dữ liệu (token và user).

**Returns:** Promise<void>

---

## Error Handling

Tất cả các service functions sẽ throw error nếu request thất bại. Nên wrap trong try-catch:

```javascript
try {
  const debts = await getAllDebts();
  // Handle success
} catch (error) {
  console.error('Error:', error.message);
  // Handle error
}
```

Nếu nhận được 401 Unauthorized, token sẽ tự động bị xóa và bạn có thể redirect user đến màn hình login.

---

## Example Usage

```javascript
import { login, getMyProfile, getAllDebts } from '@/service';
import { storage } from '@/utils/storage';

// Login
const loginUser = async (email, password) => {
  try {
    const response = await login({ email, password });
    if (response.token) {
      await storage.setToken(response.token);
      await storage.setUser(response.user);
      return true;
    }
  } catch (error) {
    console.error('Login failed:', error);
    return false;
  }
};

// Get profile
const loadProfile = async () => {
  try {
    const profile = await getMyProfile();
    return profile;
  } catch (error) {
    console.error('Failed to load profile:', error);
    return null;
  }
};

// Get debts
const loadDebts = async () => {
  try {
    const debts = await getAllDebts();
    return debts;
  } catch (error) {
    console.error('Failed to load debts:', error);
    return [];
  }
};
```



