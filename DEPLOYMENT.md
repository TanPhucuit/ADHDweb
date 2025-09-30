# Production Deployment Guidelines for Notification System

## 🚀 Deployment Checklist

### 1. Database Setup
- [ ] Run SQL migrations in `scripts/` folder
- [ ] Create `break_requests` table 
- [ ] Enable Row Level Security (RLS)
- [ ] Set up proper indexes

### 2. Environment Variables
```bash
# Production .env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### 3. Real-time Scaling Solutions

#### Option A: Server-Sent Events (SSE) - Current Implementation
**Pros:** 
- Simple to implement
- Works with HTTP/2
- Automatic reconnection

**Cons:**
- Limited concurrent connections per server
- Not ideal for high traffic

**Production Setup:**
```javascript
// Use Redis for pub/sub if multiple server instances
const redis = new Redis(process.env.REDIS_URL)

// Publish notification
await redis.publish(`notifications:${parentId}`, JSON.stringify(notification))

// Subscribe in SSE endpoint
redis.subscribe(`notifications:${parentId}`)
```

#### Option B: WebSockets with Socket.io
**For high-traffic production:**
```bash
npm install socket.io socket.io-client
```

```javascript
// server.js
import { Server } from 'socket.io'

const io = new Server(server, {
  cors: { origin: process.env.NEXT_PUBLIC_BASE_URL }
})

io.on('connection', (socket) => {
  socket.on('join-parent', (parentId) => {
    socket.join(`parent:${parentId}`)
  })
})

// Emit notification
io.to(`parent:${parentId}`).emit('notification', notificationData)
```

#### Option C: Supabase Realtime (Recommended)
```javascript
// Use Supabase built-in realtime
const supabase = createClient(url, key, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Subscribe to notifications table changes
supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `to_user_id=eq.${parentId}`
  }, (payload) => {
    setNotifications(prev => [payload.new, ...prev])
  })
  .subscribe()
```

### 4. Performance Optimizations

#### Database Indexing
```sql
-- Essential indexes for production
CREATE INDEX CONCURRENTLY idx_notifications_to_user_created 
ON notifications(to_user_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_schedule_activity_child_status 
ON schedule_activity(childid, status);

CREATE INDEX CONCURRENTLY idx_break_requests_parent_created 
ON break_requests(parent_id, created_at DESC);
```

#### Caching Strategy
```javascript
// Redis caching for frequent queries
const cacheKey = `notifications:${parentId}:latest`
const cached = await redis.get(cacheKey)

if (cached) {
  return JSON.parse(cached)
}

const notifications = await fetchFromDatabase()
await redis.setex(cacheKey, 60, JSON.stringify(notifications)) // Cache 1 minute
```

### 5. Security Enhancements

#### API Authentication Middleware
```javascript
// middleware.ts
export async function middleware(request: NextRequest) {
  const token = request.headers.get('authorization')
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify JWT token
  const payload = await verifyToken(token)
  if (!payload) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  // Add user to request context
  request.headers.set('x-user-id', payload.sub)
}

export const config = {
  matcher: '/api/:path*'
}
```

#### Row Level Security Policies
```sql
-- Only allow users to see their own notifications
CREATE POLICY "notifications_own_data" ON notifications
  FOR ALL USING (
    to_user_id = auth.uid()::text OR 
    from_user_id = auth.uid()::text
  );
```

### 6. Monitoring & Analytics

#### Health Checks
```javascript
// /api/health
export async function GET() {
  const checks = {
    database: await checkDatabase(),
    notifications: await checkNotificationSystem(),
    realtime: await checkRealtimeConnection()
  }
  
  return NextResponse.json({
    status: Object.values(checks).every(Boolean) ? 'healthy' : 'degraded',
    checks,
    timestamp: new Date().toISOString()
  })
}
```

#### Metrics Collection
```javascript
// Track notification delivery rates
const metrics = {
  notifications_sent: counter,
  notifications_delivered: counter,
  connection_count: gauge,
  response_time: histogram
}
```

### 7. Error Handling & Fallbacks

#### Graceful Degradation
```javascript
// Fallback to polling if real-time fails
const [useRealtime, setUseRealtime] = useState(true)

useEffect(() => {
  if (!isConnected && useRealtime) {
    console.log('🔄 Falling back to polling')
    setUseRealtime(false)
    
    // Start polling every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }
}, [isConnected, useRealtime])
```

### 8. Deployment Platforms

#### Vercel (Recommended for Next.js)
```json
// vercel.json
{
  "functions": {
    "app/api/notifications/stream/route.ts": {
      "maxDuration": 300
    }
  },
  "crons": [
    {
      "path": "/api/cleanup-notifications",
      "schedule": "0 0 * * *"
    }
  ]
}
```

#### Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### 9. Testing Strategy

#### Load Testing
```bash
# Test concurrent notification streams
artillery run load-test.yml

# load-test.yml
config:
  target: 'https://your-app.com'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Notification stream"
    flow:
      - get:
          url: "/api/notifications/stream?parentId=23"
```

## ✅ Production-Ready Checklist

- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] CDN configured for static assets
- [ ] Error monitoring setup (Sentry)
- [ ] Log aggregation configured
- [ ] Health checks implemented
- [ ] Load balancer configured
- [ ] Backup strategy implemented
- [ ] Performance monitoring setup

## 🎯 Expected Performance

- **Real-time latency:** < 1 second
- **Concurrent users:** 1000+ per server instance
- **Database queries:** < 100ms average
- **Notification delivery:** 99.9% success rate
- **Uptime:** 99.9% SLA