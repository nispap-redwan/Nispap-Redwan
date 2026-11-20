import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_LOCATIONS, VillageLocation } from './src/data/villageData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

interface ActiveAlarm {
  id: string;
  active: boolean;
  senderName: string;
  senderPhone?: string;
  locationName: string;
  emergencyType: string;
  details?: string;
  lat?: number;
  lng?: number;
  triggeredAt: number;
}

interface AlertLog {
  id: string;
  senderName: string;
  locationName: string;
  emergencyType: string;
  triggeredAt: number;
  stoppedAt?: number;
  resolvedBy?: string;
}

let activeAlarm: ActiveAlarm | null = null;
const alertHistory: AlertLog[] = [];
let villageLocations: VillageLocation[] = JSON.parse(JSON.stringify(INITIAL_LOCATIONS));

// SSE clients list
type SSEClient = {
  id: number;
  res: express.Response;
};
let sseClients: SSEClient[] = [];
let clientIdCounter = 0;

function broadcastEvent(type: string, data: unknown) {
  const payload = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach(client => {
    try {
      client.res.write(payload);
    } catch {
      // ignore broken client
    }
  });
}

// Keep-alive heartbeat every 20 seconds
setInterval(() => {
  sseClients.forEach(client => {
    try {
      client.res.write(': keepalive\n\n');
    } catch {
      // ignore
    }
  });
}, 20000);

// SSE stream for real-time alarm broadcast across all devices
app.get('/api/alarm/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const clientId = ++clientIdCounter;
  sseClients.push({ id: clientId, res });

  // Send current state immediately
  res.write(`event: init\ndata: ${JSON.stringify({ activeAlarm, clientCount: sseClients.length })}\n\n`);

  // Notify everyone of updated listener count
  broadcastEvent('clients_count', { count: sseClients.length });

  req.on('close', () => {
    sseClients = sseClients.filter(c => c.id !== clientId);
    broadcastEvent('clients_count', { count: sseClients.length });
  });
});

// Trigger emergency alarm
app.post('/api/alarm/trigger', (req, res) => {
  const { senderName, senderPhone, locationName, emergencyType, details, lat, lng } = req.body;

  const newAlarm: ActiveAlarm = {
    id: `alarm-${Date.now()}`,
    active: true,
    senderName: senderName || 'গ্রামের একজন সচেতন নাগরিক',
    senderPhone: senderPhone || '',
    locationName: locationName || 'অনির্দিষ্ট লোকেশন',
    emergencyType: emergencyType || 'ডাকাত/চোর বা জরুরি বিপদ',
    details: details || '',
    lat: typeof lat === 'number' ? lat : undefined,
    lng: typeof lng === 'number' ? lng : undefined,
    triggeredAt: Date.now()
  };

  activeAlarm = newAlarm;

  alertHistory.unshift({
    id: newAlarm.id,
    senderName: newAlarm.senderName,
    locationName: newAlarm.locationName,
    emergencyType: newAlarm.emergencyType,
    triggeredAt: newAlarm.triggeredAt
  });

  broadcastEvent('alarm_triggered', newAlarm);
  res.json({ success: true, alarm: newAlarm });
});

// Stop alarm
app.post('/api/alarm/stop', (req, res) => {
  const { resolvedBy } = req.body;

  if (activeAlarm) {
    const hist = alertHistory.find(h => h.id === activeAlarm?.id);
    if (hist) {
      hist.stoppedAt = Date.now();
      hist.resolvedBy = resolvedBy || 'গ্রামবাসী';
    }
  }

  activeAlarm = null;
  broadcastEvent('alarm_stopped', { stoppedAt: Date.now(), resolvedBy: resolvedBy || 'গ্রামবাসী' });
  res.json({ success: true, message: 'এলার্ম বন্ধ করা হয়েছে।' });
});

// Alarm status & history
app.get('/api/alarm/status', (_req, res) => {
  res.json({
    activeAlarm,
    active: !!activeAlarm,
    connectedDevices: sseClients.length,
    alertHistory: alertHistory.slice(0, 20)
  });
});

// Village Locations API
app.get('/api/village/locations', (_req, res) => {
  res.json({ locations: villageLocations });
});

// Update youth profile or add phone number
app.post('/api/village/locations/update-youth', (req, res) => {
  const { locationId, youthId, name, phone, role } = req.body;
  const loc = villageLocations.find(l => l.id === locationId);
  if (!loc) {
    return res.status(404).json({ error: 'লোকেশন পাওয়া যায়নি' });
  }

  const youth = loc.youths.find(y => y.id === youthId);
  if (youth) {
    if (name !== undefined) youth.name = name;
    if (phone !== undefined) youth.phone = phone;
    if (role !== undefined) youth.role = role;
  } else {
    // Add as new youth to this location
    loc.youths.push({
      id: `y-${Date.now()}`,
      name: name || 'নতুন সচেতন সদস্য',
      phone: phone || '',
      role: role || 'সচেতন সদস্য'
    });
  }

  broadcastEvent('locations_updated', { locations: villageLocations });
  res.json({ success: true, location: loc });
});

// Add new location (house, shop, mosque, road point)
app.post('/api/village/locations/add', (req, res) => {
  const { name, roadOrArea, lat, lng, type, description, youths } = req.body;
  if (!name || lat === undefined || lng === undefined) {
    return res.status(400).json({ error: 'নাম এবং কোঅর্ডিনেট প্রয়োজন' });
  }

  const newLoc: VillageLocation = {
    id: `loc-${Date.now()}`,
    name,
    roadOrArea: roadOrArea || 'গ্রাম্য সড়ক',
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    type: type || 'house',
    description: description || '',
    youths: Array.isArray(youths) ? youths : []
  };

  villageLocations.push(newLoc);
  broadcastEvent('locations_updated', { locations: villageLocations });
  res.json({ success: true, location: newLoc });
});

// Update coordinates
app.post('/api/village/locations/update-coord', (req, res) => {
  const { locationId, lat, lng } = req.body;
  const loc = villageLocations.find(l => l.id === locationId);
  if (!loc) {
    return res.status(404).json({ error: 'লোকেশন পাওয়া যায়নি' });
  }

  loc.lat = parseFloat(lat);
  loc.lng = parseFloat(lng);
  broadcastEvent('locations_updated', { locations: villageLocations });
  res.json({ success: true, location: loc });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Village Security Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
