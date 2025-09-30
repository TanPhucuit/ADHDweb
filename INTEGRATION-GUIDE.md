# Backend-Frontend Integration Guide

Hệ thống API đã được tạo sẵn để kết nối Django backend với React frontend. Tài liệu này hướng dẫn cách tích hợp dữ liệu từ backend vào các component hiện có **mà không thay đổi giao diện UI**.

## 🔧 Hệ thống đã được tạo

### 1. API Client (`lib/api-client.ts`)
- Complete REST client để giao tiếp với Django API
- Authentication tự động với token
- Error handling và retry logic
- Support cho tất cả modules: focus, medication, rewards, schedule, chat

### 2. React Hooks (`hooks/use-api.ts`)
- Custom hooks cho từng module
- Real-time data fetching với SWR pattern
- Loading states và error handling
- Optimistic updates

### 3. Global State (`lib/store.ts`)
- Zustand store cho app state
- Persistent storage
- Data synchronization
- User management

### 4. Data Transformers (`lib/data-transformers.ts`)
- Convert data giữa Django format và React format
- Date/time formatting
- Type safety

### 5. Authentication (`lib/auth.ts`)
- Login/logout functionality
- Permission system
- Route protection
- Session management

## 🚀 Cách sử dụng trong components hiện có

### Ví dụ 1: Focus Dashboard
```typescript
// components/parent/focus-trend-chart.tsx
import { useFocusDashboard } from '@/hooks/use-api'

export function FocusTrendChart() {
  // Load data từ backend
  const { data: focusData, isLoading, error } = useFocusDashboard()
  
  // Component UI giữ nguyên, chỉ thay data source
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading data</div>
  
  // Sử dụng focusData thay vì mock data
  const chartData = focusData?.weeklyStats || []
  
  return (
    // Existing UI components giữ nguyên 100%
    <div className="chart-container">
      {/* Chart rendering code không đổi */}
    </div>
  )
}
```

### Ví dụ 2: Medication Dashboard
```typescript
// components/medication/medication-reminder-dashboard.tsx
import { useMedication } from '@/hooks/use-api'

export function MedicationReminderDashboard() {
  // Load medication data
  const { 
    data: medications, 
    isLoading,
    actions: { logMedication, updateReminder }
  } = useMedication()
  
  // Handler functions for actions
  const handleTakeMedication = async (medicationId: string) => {
    await logMedication({
      medication_id: medicationId,
      taken_at: new Date().toISOString(),
      notes: ''
    })
  }
  
  return (
    // Existing UI layout giữ nguyên
    <div className="medication-dashboard">
      {medications?.map(med => (
        <div key={med.id} className="medication-card">
          {/* Existing card design không đổi */}
          <button onClick={() => handleTakeMedication(med.id)}>
            Take Medication
          </button>
        </div>
      ))}
    </div>
  )
}
```

### Ví dụ 3: Rewards System
```typescript
// components/rewards/reward-display.tsx
import { useRewards } from '@/hooks/use-api'

export function RewardDisplay() {
  const { 
    data: rewardsData, 
    isLoading,
    actions: { claimReward }
  } = useRewards()
  
  const handleClaimReward = async (rewardId: string) => {
    await claimReward(rewardId)
  }
  
  return (
    // Existing reward UI giữ nguyên
    <div className="rewards-container">
      <div className="points-display">
        Points: {rewardsData?.totalPoints || 0}
      </div>
      {rewardsData?.availableRewards?.map(reward => (
        // Existing reward card design
        <div key={reward.id} className="reward-card">
          {/* UI elements không thay đổi */}
        </div>
      ))}
    </div>
  )
}
```

## 📋 Steps để tích hợp

### Step 1: Import hooks vào component
```typescript
import { useFocusDashboard, useMedication, useRewards, useSchedule } from '@/hooks/use-api'
```

### Step 2: Replace mock data với real data
```typescript
// Before (mock data)
const mockData = [...]

// After (real data)
const { data, isLoading, error } = useFocusDashboard()
```

### Step 3: Add loading và error states
```typescript
if (isLoading) return <LoadingSpinner />
if (error) return <ErrorMessage error={error} />
```

### Step 4: Update event handlers
```typescript
// Before (local state)
const handleClick = () => {
  setLocalState(...)
}

// After (API calls)
const { actions } = useFocusDashboard()
const handleClick = async () => {
  await actions.startFocusSession(...)
}
```

## 🔄 Data Flow

```
Django Backend (API) 
    ↓
API Client (lib/api-client.ts)
    ↓  
React Hooks (hooks/use-api.ts)
    ↓
Global Store (lib/store.ts)
    ↓
Components (unchanged UI)
```

## 🛡️ Authentication

Tất cả API calls tự động include authentication token:

```typescript
// Automatic authentication
const { data } = useFocusDashboard() // Token automatically included

// Manual login
import { authService } from '@/lib/auth'

const handleLogin = async (email: string, password: string) => {
  const result = await authService.login({ email, password })
  if (result.success) {
    // User logged in, data hooks will now work
  }
}
```

## 🔧 Configuration

Backend API URL đã được config trong `lib/config.ts`:

```typescript
export const config = {
  API_BASE_URL: 'http://127.0.0.1:8000', // Django server
  // ... other settings
}
```

## 📊 Real-time Updates

Data automatically syncs với backend:

```typescript
// Data tự động refresh theo interval
const { data } = useFocusDashboard() // Auto-refreshes every 30 seconds

// Manual refresh
const { actions } = useFocusDashboard()
await actions.refresh()
```

## 🎯 Key Benefits

1. **Zero UI Changes**: Existing components giữ nguyên 100% design
2. **Type Safety**: Full TypeScript support
3. **Error Handling**: Comprehensive error management
4. **Performance**: Automatic caching và optimization  
5. **Real-time**: Live data updates
6. **Offline Support**: Local storage fallbacks

## 🚀 Next Steps

1. Django server đã chạy tại `http://127.0.0.1:8000/`
2. API client đã sẵn sàng
3. Chỉ cần import hooks vào components và thay data source
4. UI components giữ nguyên hoàn toàn

**Tất cả infrastructure đã được tạo sẵn - chỉ cần tích hợp vào existing components!**