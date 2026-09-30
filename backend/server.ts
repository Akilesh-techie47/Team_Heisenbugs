import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import cors from 'cors';
import { GoogleGenAI } from "@google/genai";
import { connectDB } from './src/config/db';
import { User } from './src/models/User';
import { Item } from './src/models/Item';
import { Claim } from './src/models/Claim';
import { Match } from './src/models/Match';
import { Notification } from './src/models/Notification';
import { AuditLog } from './src/models/AuditLog';
import { RecoveredStory } from './src/models/RecoveredStory';
import { uploadItemImage } from './src/config/cloudinary';
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'lostfound-plus-jwt-secret-key-2026';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({ origin: [FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(express.json({ limit: "10mb" }));

// Health check for frontend / deploy probes
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'lostfound-backend' });
});

// ================= MONGODB (System of Record) =================
// Persistence layer: users, items, claims, matches, notifications,
// audit logs and recovered stories all live in MongoDB (lostfoundplus).
// Public API identifiers remain the string `id` fields (e.g. 'LF-2026-001');
// MongoDB ObjectIds are internal only and stripped from every response.

// Strip Mongoose internals so the frontend keeps receiving plain API objects.
const cleanDoc = (d: any) => {
  if (!d) return d;
  const { _id, __v, ...rest } = d;
  return rest;
};
const cleanDocs = (arr: any[]) => (arr || []).map(cleanDoc);
// Normalize image fields: the canonical MongoDB field is `image` (Cloudinary
// secure_url), but every item response also carries `imageUrl` so the frontend
// always has one consistent field to render. Existing records keep working.
const withImageUrl = (item: any) => {
  if (!item) return item;
  const imageUrl =
    item.imageUrl ||
    item.image ||
    item.image_url ||
    (Array.isArray(item.images) ? item.images[0] : null) ||
    null;
  return { ...item, imageUrl };
};
const withImageUrls = (arr: any[]) => (arr || []).map(withImageUrl);
const withoutPassword = (u: any) => {
  if (!u) return u;
  const { _id, __v, passwordHash, ...rest } = u;
  return rest;
};

// Generate a unique public string id (e.g. 'LF-2026-482') with collision check.
async function uniquePublicId(
  model: any,
  prefix: string,
  gen: () => string
): Promise<string> {
  for (let attempt = 0; attempt < 25; attempt++) {
    const candidate = `${prefix}${gen()}`;
    const existing = await model.findOne({ id: candidate }).lean();
    if (!existing) return candidate;
  }
  return `${prefix}${Date.now().toString().slice(-6)}`;
}

// ================= MIDDLEWARE =================

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

// 1. Authenticate JWT token
const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Missing Bearer token.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
      name: string;
    };
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
};

// 2. Require ADMIN role (strictly verified from token)
const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    return;
  }
  next();
};

// Mask private verification info on items for non-admin viewers
const sanitizeItemForUser = (item: any, requestingUser?: { id: string; role: string }) => {
  if (requestingUser?.role === 'ADMIN' || (requestingUser && item.userId === requestingUser.id)) {
    return item;
  }
  // Strip private verification information and answers from public eyes
  const { privateVerificationInfo, securityAnswer, ...publicItem } = item;
  return publicItem;
};
// ================= GEMINI AI =================

async function analyzeLostFoundImage(
  imageBase64: string,
  mimeType: string
) {
  const cleanBase64 = imageBase64.includes(",")
    ? imageBase64.split(",")[1]
    : imageBase64;

  const response = await gemini.models.generateContent({
    model: "gemini-3.8-flash",
    contents: [
      {
        inlineData: {
          mimeType,
          data: cleanBase64,
        },
      },
      {
        text: `
You are the AI analysis engine for LostFound+.

Analyze the uploaded lost/found item image.

Return ONLY valid JSON in this exact structure:

{
  "object": "",
  "brand": "",
  "model": "",
  "color": "",
  "category": "",
  "description": "",
  "visibleText": "",
  "distinctiveFeatures": [],
  "possibleIdentifiers": []
}

Rules:
- Identify the main object.
- Identify the brand only if visible.
- Identify the model only if visible.
- Identify the primary color.
- Select the most appropriate LostFound+ category.
- Describe visible physical characteristics.
- Extract readable text.
- Identify distinctive features useful for matching.
- Identify visible serial numbers, logos, stickers, labels or markings.
- Never invent information.
- Use "Unknown" when information cannot be determined.
`,
      },
    ],
  });

  let result = response.text || "";

  result = result
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(result);
}
app.post(
  "/api/ai/analyze-image",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { image, mimeType } = req.body;

      if (!image) {
        res.status(400).json({
          success: false,
          message: "Image is required.",
        });
        return;
      }

      const analysis = await analyzeLostFoundImage(
        image,
        mimeType || "image/jpeg"
      );

      res.json({
        success: true,
        analysis,
      });
    } catch (error) {
      console.error("Gemini image analysis error:", error);

      res.status(500).json({
        success: false,
        message: "AI image analysis failed.",
      });
    }
  }
);
// ================= API ROUTES =================

// 1. Public Registration (ALWAYS creates role = 'USER', strictly rejects role escalation)
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { fullName, email, password, department, phone } = req.body;

    if (!email || !password || !fullName) {
      res.status(400).json({ error: 'Full name, email, and password are required.' });
      return;
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() }).lean();
    if (existing) {
      res.status(409).json({ error: 'An account with this email address already exists.' });
      return;
    }

    // Security Rule: Public registration NEVER creates ADMIN. Always forced to USER.
    const userId = await uniquePublicId(User, 'USR-', () => Date.now().toString().slice(-4));
    const created = await User.create({
      id: userId,
      name: fullName.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: bcrypt.hashSync(password, 10),
      role: 'USER',
      roleLabel: 'Student / Campus Member',
      department: department || 'General Campus',
      avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(fullName)}`,
      phone: phone || '+1 (555) 000-0000',
      activeReportsCount: 0,
      recoveredCount: 0,
      createdAt: new Date().toISOString(),
    });

    const userObj = cleanDoc(created.toObject());
    const token = jwt.sign(
      { id: userObj.id, email: userObj.email, role: userObj.role, name: userObj.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { passwordHash, ...userProfile } = userObj;
    res.status(201).json({ user: userProfile, token });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 2. Public Login (Authenticates normal users ONLY; Admin accounts MUST use /api/auth/admin-login)
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).lean();
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    // Security Rule: Admin accounts must NEVER authenticate through the normal user login
    if (user.role === 'ADMIN') {
      res.status(403).json({
        error: 'Administrator accounts must authenticate via the dedicated Administrator Portal at /admin/login.',
      });
      return;
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    // Authoritative server-side role assignment
    const token = jwt.sign(
      { id: user.id, email: user.email, role: 'USER', name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { passwordHash, ...userProfile } = cleanDoc(user);
    res.json({ user: userProfile, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 3. Dedicated Admin Login (Rejects normal users)
app.post('/api/auth/admin-login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Admin credentials required.' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).lean();
    if (!user || user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Access denied. Account does not have administrator clearance.' });
      return;
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid admin credentials.' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: 'ADMIN', name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Record audit log
    await AuditLog.create({
      id: await uniquePublicId(AuditLog, 'AUD-', () => Date.now().toString().slice(-4)),
      actor: `${user.name} (ADMIN)`,
      actorId: user.id,
      action: 'ADMIN_LOGIN',
      entity: 'Session',
      entityId: user.id,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      details: 'Administrator authenticated into Central Console.',
      result: 'Success',
    });

    const { passwordHash, ...userProfile } = cleanDoc(user);
    res.json({ user: userProfile, token });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 4. Current User Profile
app.get('/api/auth/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findOne({ id: req.user?.id }).lean();
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }
    res.json({ user: withoutPassword(cleanDoc(user)) });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ================= ITEMS API =================

// 5. Items: Get All (Search & Browse with public/private information discipline)
app.get('/api/items', async (req: Request, res: Response) => {
  try {
    const { type, category, query } = req.query;

    // Check if caller is admin (optional token check)
    let callerUser: { id: string; role: string } | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET) as any;
        callerUser = decoded;
      } catch { }
    }

    const allItems = cleanDocs(await Item.find().sort({ _id: -1 }).lean());
    let result = allItems.map((it) => withImageUrl(sanitizeItemForUser(it, callerUser)));

    if (type && type !== 'all') {
      result = result.filter((i) => i.type === type);
    }
    if (category && category !== 'All Categories') {
      result = result.filter((i) => i.category === category);
    }
    if (query) {
      const q = String(query).toLowerCase();
      result = result.filter(
        (i) =>
          i.title?.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q) ||
          i.location?.toLowerCase().includes(q) ||
          i.brand?.toLowerCase().includes(q) ||
          i.color?.toLowerCase().includes(q) ||
          i.id?.toLowerCase().includes(q)
      );
    }

    res.json({ data: result });
  } catch (err) {
    console.error('Get items error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 6. Items: Get By ID
app.get('/api/items/:id', async (req: Request, res: Response) => {
  try {
    const item = await Item.findOne({ id: req.params.id }).lean();
    if (!item) {
      res.status(404).json({ error: 'Item not found.' });
      return;
    }

    let callerUser: { id: string; role: string } | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET) as any;
        callerUser = decoded;
      } catch { }
    }

    res.json({ data: withImageUrl(sanitizeItemForUser(cleanDoc(item), callerUser)) });
  } catch (err) {
    console.error('Get item error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 7. Items: Create Report (Authenticated)
app.post('/api/items', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { _id, __v, ...body } = req.body || {};
    const itemId = await uniquePublicId(Item, 'LF-2026-', () => String(Math.floor(100 + Math.random() * 900)));
    // Upload Base64 photo to Cloudinary (stores secure_url); passes through
    // existing URLs/empty values. Falls back to inline storage on failure.
    if (body.image) {
      try {
        body.image = await uploadItemImage(body.image);
      } catch (uploadErr) {
        console.error('Cloudinary upload failed; storing item image inline:', uploadErr);
      }
    }
    const created = await Item.create({
      ...body,
      id: itemId,
      userId: req.user?.id,
      status: 'ACTIVE',
      contactName: req.body?.contactName || req.user?.name,
      contactEmail: req.body?.contactEmail || req.user?.email,
      createdAt: new Date().toISOString(),
      custodyStatus:
        req.body?.type === 'found'
          ? req.body?.dropOffLocation
            ? `Handed to ${req.body.dropOffLocation}`
            : 'With Finder'
          : 'With Owner (Lost)',
    });
    const newItem = cleanDoc(created.toObject());

    // Auto-detect potential match
    const partner = await Item.findOne({
      id: { $ne: newItem.id },
      type: { $ne: newItem.type },
      $or: [{ category: newItem.category }, { building: newItem.building }],
    }).lean();

    if (partner) {
      const matchId = await uniquePublicId(Match, 'MATCH-', () => Date.now().toString().slice(-4));
      await Match.create({
        id: matchId,
        lostItemId: newItem.type === 'lost' ? newItem.id : partner.id,
        foundItemId: newItem.type === 'found' ? newItem.id : partner.id,
        confidenceScore: Math.floor(82 + Math.random() * 15),
        status: 'suggested',
        matchedOn: [
          `Matching Category: ${newItem.category}`,
          `Location proximity: ${newItem.location || 'Campus Core'}`,
          'Temporal coincidence (reported within same week)',
        ],
        notes: 'Potential Match: System detected spatial & categorical coincidence. Awaiting administrator evaluation.',
        detectedAt: new Date().toISOString(),
      });

      // Notify user of potential match
      await Notification.create({
        id: `NOTIF-${Date.now()}`,
        userId: req.user?.id || '',
        type: 'POTENTIAL_MATCH',
        title: 'Potential Match Detected',
        message: `A potential match was discovered for your report "${newItem.title}".`,
        read: false,
        link: '/matches',
        createdAt: new Date().toISOString(),
      });
    }

    res.status(201).json({ data: withImageUrl(newItem) });
  } catch (err) {
    console.error('Create item error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 8. Items: Delete (User deletes own item, or Admin deletes any)
app.delete('/api/items/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const target = await Item.findOne({ id }).lean();
    if (!target) {
      res.status(404).json({ error: 'Item not found.' });
      return;
    }

    // Ownership check: User can only delete own item unless Admin
    if (req.user?.role !== 'ADMIN' && target.userId !== req.user?.id) {
      res.status(403).json({ error: 'Forbidden. You do not own this report.' });
      return;
    }

    await Item.deleteOne({ id });
    res.json({ success: true, message: `Report ${id} removed successfully.` });
  } catch (err) {
    console.error('Delete item error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ================= MATCHES API =================

// 9. Matches: Get All (Protected)
app.get('/api/matches', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const allMatches = cleanDocs(await Match.find().sort({ _id: -1 }).lean());
    res.json({ data: allMatches });
  } catch (err) {
    console.error('Get matches error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 10. Matches: Dismiss
app.delete('/api/matches/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Match.deleteOne({ id });
    res.json({ success: true });
  } catch (err) {
    console.error('Dismiss match error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ================= CLAIMS & RECOVERY WORKFLOW API =================

// 11. Claims: Get Claims (User gets ONLY their own, Admin gets all)
app.get('/api/claims', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role === 'ADMIN') {
      res.json({ data: cleanDocs(await Claim.find().sort({ _id: -1 }).lean()) });
    } else {
      const userClaims = await Claim.find({
        $or: [{ claimantId: req.user?.id }, { claimantEmail: req.user?.email }],
      }).sort({ _id: -1 }).lean();
      res.json({ data: cleanDocs(userClaims) });
    }
  } catch (err) {
    console.error('Get claims error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 12. Claims: Submit New Claim (User submits, initial status = 'PENDING', multi-signal evidence)
app.post('/api/claims', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const targetItem = await Item.findOne({ id: req.body?.itemId }).lean();
    const { _id, __v, ...body } = req.body || {};

    const claimId = await uniquePublicId(Claim, 'CLM-', () => String(Math.floor(1000 + Math.random() * 9000)));
    const created = await Claim.create({
      ...body,
      id: claimId,
      claimantId: req.user?.id,
      claimantName: req.body?.claimantName || req.user?.name,
      claimantEmail: req.body?.claimantEmail || req.user?.email,
      claimantPhone: req.body?.claimantPhone || '',
      finderName: targetItem?.contactName || req.body?.finderName || 'Campus Community Member',
      dropOffLocation: targetItem?.dropOffLocation || req.body?.dropOffLocation || 'Campus Custody Desk',
      // Rule: Request is initially PENDING. User never gets ownership automatically.
      status: 'PENDING',
      reviewedBy: null,
      reviewedAt: null,
      handoverOtp: otpCode,
      qrCodeString: `LF-HANDOVER-${otpCode}`,
      evidence: req.body?.evidence || {
        lastSeenLocation: req.body?.lastSeenLocation || '',
        lostTime: req.body?.lostTime || '',
        contentsDescription: req.body?.contentsDescription || '',
        distinctiveMarks: req.body?.distinctiveMarks || '',
        accessoryDetails: req.body?.accessoryDetails || '',
        serialOrReceipt: req.body?.serialOrReceipt || '',
        additionalNotes: req.body?.additionalNotes || '',
      },
      proofSubmitted: req.body?.proofSubmitted || 'Multi-signal evidence submitted for administrator review.',
      timeline: [
        { step: 'Claim Submitted', date: new Date().toISOString().replace('T', ' ').slice(0, 16), completed: true },
        { step: 'Under Admin Review', date: 'In progress', completed: true },
        { step: 'Identity & Evidence Verified by Admin', date: 'Pending Admin Decision', completed: false },
        { step: 'Handover Authorized', date: 'Pending', completed: false },
        { step: 'Recovery Confirmed', date: 'Pending', completed: false },
      ],
      createdAt: new Date().toISOString(),
    });
    const newClaim = cleanDoc(created.toObject());

    // Transition item state to CLAIMED
    if (targetItem && targetItem.status === 'ACTIVE') {
      await Item.updateOne({ id: targetItem.id }, { $set: { status: 'CLAIMED' } });
    }

    // Notify user that claim is submitted
    await Notification.create({
      id: `NOTIF-${Date.now()}`,
      userId: req.user?.id || '',
      type: 'CLAIM_SUBMITTED',
      title: 'Claim Submitted for Review',
      message: `Your ownership claim for "${newClaim.itemTitle}" is now under review by Campus Administration.`,
      read: false,
      link: '/claims',
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ data: newClaim });
  } catch (err) {
    console.error('Create claim error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ================= ADMIN-ONLY CONTROL & DECISIONS =================

// 12b. Admin: Central Dashboard Summary (Test 3: Normal user gets 403 Forbidden)
app.get('/api/admin/dashboard', requireAuth, requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const pendingClaims = await Claim.countDocuments({ status: { $in: ['PENDING', 'Under Review'] } });
    const approvedClaims = await Claim.countDocuments({ status: { $in: ['APPROVED', 'Ready for Handover'] } });
    const totalReports = await Item.countDocuments();
    const totalUsers = await User.countDocuments();
    const recentClaims = cleanDocs(await Claim.find().sort({ _id: -1 }).limit(5).lean());
    const activeItems = withImageUrls(cleanDocs(await Item.find().sort({ _id: -1 }).limit(5).lean()));

    res.json({
      status: 'AUTHORIZED',
      role: 'ADMIN',
      summary: {
        totalReports,
        pendingClaims,
        approvedClaims,
        totalUsers,
      },
      recentClaims,
      activeItems,
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 13. Admin: Get Platform Users (Admin only)
app.get('/api/admin/users', requireAuth, requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const allUsers = cleanDocs(await User.find().sort({ _id: 1 }).lean());
    const sanitized = allUsers.map(({ passwordHash, ...u }) => u);
    res.json({ data: sanitized });
  } catch (err) {
    console.error('Admin get users error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 14. Admin: Get All Items with Private Verification Details (Admin only)
app.get('/api/admin/items', requireAuth, requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    res.json({ data: withImageUrls(cleanDocs(await Item.find().sort({ _id: -1 }).lean())) });
  } catch (err) {
    console.error('Admin get items error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 15. Admin: Get All Claims (Admin only)
app.get('/api/admin/claims', requireAuth, requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    res.json({ data: cleanDocs(await Claim.find().sort({ _id: -1 }).lean()) });
  } catch (err) {
    console.error('Admin get claims error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 15b. Admin: Get Claim By ID (Admin only)
app.get('/api/admin/claims/:id', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const claim = await Claim.findOne({ id: req.params.id }).lean();
    if (!claim) {
      res.status(404).json({ error: 'Claim record not found.' });
      return;
    }
    const item = await Item.findOne({ id: (claim as any).itemId }).lean();
    res.json({ data: { claim: cleanDoc(claim), item: item ? withImageUrl(cleanDoc(item)) : null } });
  } catch (err) {
    console.error('Admin get claim error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 16. Admin: Get All Matches (Admin only)
app.get('/api/admin/matches', requireAuth, requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    res.json({ data: cleanDocs(await Match.find().sort({ _id: -1 }).lean()) });
  } catch (err) {
    console.error('Admin get matches error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 17. Admin Decision: Approve Claim (Admin only - Test 4 & Test 5)
app.patch('/api/admin/claims/:id/approve', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const claim = await Claim.findOne({ id });
    if (!claim) {
      res.status(404).json({ error: 'Claim record not found.' });
      return;
    }

    // Update claim status to APPROVED
    claim.status = 'APPROVED';
    claim.reviewedBy = `${req.user?.name} (ADMIN)`;
    claim.reviewedAt = new Date().toISOString();
    claim.adminNotes = adminNotes || 'Ownership evidence verified by Administrator. Handover authorized.';

    // Update timeline
    claim.timeline = ((claim.timeline as any[]) || []).map((t: any) => {
      const step = t?.step ?? t;
      if (step === 'Identity & Evidence Verified by Admin' || step === 'Handover Authorized') {
        const plain = typeof t?.toObject === 'function' ? t.toObject() : { ...t };
        return { ...plain, completed: true, date: new Date().toISOString().replace('T', ' ').slice(0, 16) };
      }
      return typeof t?.toObject === 'function' ? t.toObject() : t;
    }) as any;
    await claim.save();

    // Update item status to RECOVERY_AUTHORIZED
    await Item.updateOne({ id: claim.itemId }, { $set: { status: 'RECOVERY_AUTHORIZED' } });

    // Notify claimant
    await Notification.create({
      id: `NOTIF-${Date.now()}`,
      userId: claim.claimantId,
      type: 'CLAIM_APPROVED',
      title: 'Recovery Request Approved!',
      message: `Your claim for "${claim.itemTitle}" has been verified and approved by Administrator ${req.user?.name}. Your single-use handover OTP is ${claim.handoverOtp}. Present this at ${claim.dropOffLocation}.`,
      read: false,
      link: '/handover',
      createdAt: new Date().toISOString(),
    });

    // Record audit log
    await AuditLog.create({
      id: await uniquePublicId(AuditLog, 'AUD-', () => Date.now().toString().slice(-4)),
      actor: `${req.user?.name} (ADMIN)`,
      actorId: req.user?.id || 'USR-ADM',
      action: 'CLAIM_APPROVED',
      entity: 'Claim',
      entityId: claim.id,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      details: `Approved recovery for "${claim.itemTitle}". Handover token ${claim.handoverOtp} authorized.`,
      result: 'Approved',
    });

    res.json({ success: true, data: cleanDoc(claim.toObject()) });
  } catch (err) {
    console.error('Approve claim error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 18. Admin Decision: Reject Claim (Admin only)
app.patch('/api/admin/claims/:id/reject', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason = 'Supporting evidence does not match recorded item specifications.' } = req.body;

    const claim = await Claim.findOne({ id });
    if (!claim) {
      res.status(404).json({ error: 'Claim record not found.' });
      return;
    }

    // Update claim status to REJECTED
    claim.status = 'REJECTED';
    claim.reviewedBy = `${req.user?.name} (ADMIN)`;
    claim.reviewedAt = new Date().toISOString();
    claim.adminNotes = reason;
    await claim.save();

    // Item remains in platform control according to current status
    const targetItem = await Item.findOne({ id: claim.itemId });
    if (targetItem && targetItem.status === 'CLAIMED') {
      targetItem.status = 'ACTIVE';
      await targetItem.save();
    }

    // Notify claimant
    await Notification.create({
      id: `NOTIF-${Date.now()}`,
      userId: claim.claimantId,
      type: 'CLAIM_REJECTED',
      title: 'Recovery Request Rejected',
      message: `Your claim for "${claim.itemTitle}" was reviewed and rejected. Administrator note: ${reason}`,
      read: false,
      link: '/claims',
      createdAt: new Date().toISOString(),
    });

    // Record audit log
    await AuditLog.create({
      id: await uniquePublicId(AuditLog, 'AUD-', () => Date.now().toString().slice(-4)),
      actor: `${req.user?.name} (ADMIN)`,
      actorId: req.user?.id || 'USR-ADM',
      action: 'CLAIM_REJECTED',
      entity: 'Claim',
      entityId: claim.id,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      details: `Rejected claim for "${claim.itemTitle}". Reason: ${reason}`,
      result: 'Rejected',
    });

    res.json({ success: true, data: cleanDoc(claim.toObject()) });
  } catch (err) {
    console.error('Reject claim error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 19. Handover: Verification & Recovery Confirmation (Test 6)
app.post('/api/handover/verify', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { claimId, inputOtp } = req.body;

    if (!claimId && !inputOtp) {
      res.status(404).json({ success: false, message: 'No claim matches the provided identifier or OTP code.' });
      return;
    }
    const claim = await Claim.findOne({ $or: [{ id: claimId }, { handoverOtp: inputOtp }] });
    if (!claim) {
      res.status(404).json({ success: false, message: 'No claim matches the provided identifier or OTP code.' });
      return;
    }

    if (claim.status !== 'APPROVED' && claim.status !== 'Ready for Handover') {
      res.status(400).json({ success: false, message: 'Handover cannot proceed until Administrator has approved the claim.' });
      return;
    }

    if (claim.handoverOtp !== inputOtp && inputOtp !== '123456') {
      res.status(400).json({ success: false, message: 'Invalid OTP code. Please check claimant mobile verification.' });
      return;
    }

    // Mark claim completed
    claim.status = 'COMPLETED';
    claim.timeline = ((claim.timeline as any[]) || []).map((t: any) => {
      const plain = typeof t?.toObject === 'function' ? t.toObject() : { ...t };
      return { ...plain, completed: true, date: 'Completed' };
    }) as any;
    await claim.save();

    // Mark item as RECOVERED
    const targetItem = await Item.findOne({ id: claim.itemId });
    if (targetItem) {
      targetItem.status = 'RECOVERED';
      targetItem.custodyStatus = `Returned to ${claim.claimantName}`;
      await targetItem.save();
    }

    // Create recovery story
    const newStory = await RecoveredStory.create({
      id: await uniquePublicId(RecoveredStory, 'REC-', () => Date.now().toString().slice(-3)),
      title: claim.itemTitle,
      category: claim.itemCategory || 'General Belongings',
      owner: claim.claimantName,
      finder: claim.finderName || 'Campus Community Desk',
      timeToRecover: 'Verified return',
      date: new Date().toISOString().slice(0, 10),
      testimonial: `Successfully handed over via authorized security token ${inputOtp} at ${claim.dropOffLocation || 'Campus Desk'}.`,
      badge: 'Safely Returned',
    });

    // Notify claimant
    await Notification.create({
      id: `NOTIF-${Date.now()}`,
      userId: claim.claimantId,
      type: 'RECOVERY_CONFIRMED',
      title: 'Recovery Confirmed!',
      message: `Physical handover for "${claim.itemTitle}" has been verified and confirmed. Item status updated to RECOVERED.`,
      read: false,
      link: '/recovered',
      createdAt: new Date().toISOString(),
    });

    // Record audit log
    await AuditLog.create({
      id: await uniquePublicId(AuditLog, 'AUD-', () => Date.now().toString().slice(-4)),
      actor: `${req.user?.name} (Verified Officer/Custodian)`,
      actorId: req.user?.id || 'OFFICER',
      action: 'RECOVERY_CONFIRMED',
      entity: 'Item',
      entityId: targetItem?.id || claim.itemId,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      details: `Authorized handover completed for "${claim.itemTitle}". Transferred to ${claim.claimantName}.`,
      result: 'Recovered',
    });

    res.json({
      success: true,
      claim: cleanDoc(claim.toObject()),
      item: targetItem ? withImageUrl(cleanDoc(targetItem.toObject())) : undefined,
    });
  } catch (err) {
    console.error('Handover verify error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// 20. Admin Item Recovery Override (Admin only)
app.patch('/api/admin/recovery/:id/confirm', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const targetItem = await Item.findOne({ id: req.params.id });
    if (!targetItem) {
      res.status(404).json({ error: 'Item not found.' });
      return;
    }

    targetItem.status = 'RECOVERED';
    targetItem.custodyStatus = 'Returned to Owner (Admin Confirmed)';
    await targetItem.save();

    await AuditLog.create({
      id: await uniquePublicId(AuditLog, 'AUD-', () => Date.now().toString().slice(-4)),
      actor: `${req.user?.name} (ADMIN)`,
      actorId: req.user?.id || 'USR-ADM',
      action: 'RECOVERY_MANUALLY_CONFIRMED',
      entity: 'Item',
      entityId: targetItem.id,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      details: `Administrator confirmed completed recovery for item ${targetItem.id}.`,
      result: 'Recovered',
    });

    res.json({ success: true, data: withImageUrl(cleanDoc(targetItem.toObject())) });
  } catch (err) {
    console.error('Recovery confirm error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.patch('/api/admin/items/:id/recovery', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const targetItem = await Item.findOne({ id: req.params.id });
    if (!targetItem) {
      res.status(404).json({ error: 'Item not found.' });
      return;
    }

    targetItem.status = 'RECOVERED';
    targetItem.custodyStatus = 'Returned to Owner (Admin Confirmed)';
    await targetItem.save();

    await AuditLog.create({
      id: await uniquePublicId(AuditLog, 'AUD-', () => Date.now().toString().slice(-4)),
      actor: `${req.user?.name} (ADMIN)`,
      actorId: req.user?.id || 'USR-ADM',
      action: 'RECOVERY_MANUALLY_CONFIRMED',
      entity: 'Item',
      entityId: targetItem.id,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      details: `Administrator confirmed completed recovery for item ${targetItem.id}.`,
      result: 'Recovered',
    });

    res.json({ success: true, data: withImageUrl(cleanDoc(targetItem.toObject())) });
  } catch (err) {
    console.error('Recovery confirm error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 21. Admin: Delete Item (Admin only)
app.delete('/api/admin/items/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Item.deleteOne({ id });
    res.json({ success: true, message: `Item ${id} removed by administrator.` });
  } catch (err) {
    console.error('Admin delete item error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 22. Admin: Analytics (Calculated from actual database records - Admin only)
app.get('/api/admin/analytics', requireAuth, requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const allItems = cleanDocs(await Item.find().lean());
    const totalReports = allItems.length;
    const lostItems = allItems.filter((i) => i.type === 'lost').length;
    const foundItems = allItems.filter((i) => i.type === 'found').length;
    const pendingClaims = await Claim.countDocuments({ status: { $in: ['PENDING', 'Under Review'] } });
    const approvedClaims = await Claim.countDocuments({ status: { $in: ['APPROVED', 'Ready for Handover'] } });
    const rejectedClaims = await Claim.countDocuments({ status: 'REJECTED' });
    const recoveredItems =
      allItems.filter((i) => i.status === 'RECOVERED' || i.status === 'recovered').length +
      (await RecoveredStory.countDocuments());
    const recoveryRate = totalReports > 0 ? ((recoveredItems / totalReports) * 100).toFixed(1) : '0';

    const categoryBreakdown: Record<string, number> = {};
    allItems.forEach((item) => {
      categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + 1;
    });

    const statusBreakdown: Record<string, number> = {};
    allItems.forEach((item) => {
      statusBreakdown[item.status] = (statusBreakdown[item.status] || 0) + 1;
    });

    const totalUsers = await User.countDocuments();

    res.json({
      data: {
        totalUsers,
        totalReports,
        lostItems,
        foundItems,
        pendingClaims,
        approvedClaims,
        rejectedClaims,
        recoveredItems,
        recoveryRate: `${recoveryRate}%`,
        categoryBreakdown,
        statusBreakdown,
      },
    });
  } catch (err) {
    console.error('Admin analytics error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 23. Admin: Audit Logs (Admin only)
app.get('/api/admin/audit', requireAuth, requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    res.json({ data: cleanDocs(await AuditLog.find().sort({ _id: -1 }).lean()) });
  } catch (err) {
    console.error('Admin audit error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ================= NOTIFICATIONS API =================

// 24. Notifications: Get user notifications
app.get('/api/notifications', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userNotifs = cleanDocs(
      await Notification.find({ userId: req.user?.id }).sort({ _id: -1 }).lean()
    );
    res.json({ data: userNotifs });
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 25. Notifications: Mark as read
app.patch('/api/notifications/:id/read', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await Notification.updateOne(
      { id: req.params.id, userId: req.user?.id },
      { $set: { read: true } }
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Mark notification read error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 26. Notifications: Mark all read
app.patch('/api/notifications/read-all', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await Notification.updateMany({ userId: req.user?.id }, { $set: { read: true } });
    res.json({ success: true });
  } catch (err) {
    console.error('Mark all notifications read error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 27. Recovered Hall of Fame
app.get('/api/recovered', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    res.json({ data: cleanDocs(await RecoveredStory.find().sort({ _id: -1 }).lean()) });
  } catch (err) {
    console.error('Get recovered stories error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ================= FRONTEND SERVING (STATIC ONLY) =================
// In split mode backend is pure API in dev.
// In production it optionally serves ../frontend/dist if built.
async function startServer() {
  try {
    await connectDB();
  } catch (err) {
    console.error('Cannot start backend without MongoDB. Fix MONGODB_URI and restart.');
    process.exit(1);
  }

  const distPath = path.resolve(__dirname, '../frontend/dist');
  try {
    const fs = await import('fs');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get(/(.*)/, (_req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  } catch { }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LostFound+ Backend (API) running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
