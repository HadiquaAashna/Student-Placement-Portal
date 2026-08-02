import express from 'express';
import session from 'express-session';
import passport from 'passport';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import ibmcloudAppId from 'ibmcloud-appid';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Company from '../models/Company.js';

const { WebAppStrategy } = ibmcloudAppId;

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretplacementportaltokenkey12345!';

const isConfigured = () =>
  !!process.env.IBM_APP_ID_TENANT_ID &&
  !!process.env.IBM_APP_ID_CLIENT_ID &&
  !!process.env.IBM_APP_ID_SECRET &&
  !!process.env.IBM_APP_ID_OAUTH_SERVER_URL &&
  process.env.IBM_APP_ID_TENANT_ID !== 'your_ibm_appid_tenant_id';

const frontendUrl = () => process.env.FRONTEND_URL || 'http://localhost:4321';
const backendUrl = () => process.env.BACKEND_URL || 'http://localhost:5000';
const redirectUri = () => process.env.APP_ID_REDIRECT_URI || `${backendUrl()}/api/auth/appid/callback`;

// Route that runs right after IBM finishes the OAuth handshake. The SDK redirects
// here via the explicit `successRedirect` option (otherwise it would bounce back
// to the login URL forever). We provision the local user and send the browser to
// the correct role dashboard.
// Route path relative to the router (mounted at /api/auth in server.js).
// Used in router.get() — do NOT include the /api/auth prefix here.
const AFTER_AUTH_ROUTE = '/appid/after';

// Full absolute URL path used in passport's successRedirect.
// Must include the /api/auth prefix since successRedirect is an absolute path.
const AFTER_AUTH_PATH = '/api/auth/appid/after';

/**
 * Mounts express-session + passport with the IBM App ID WebAppStrategy.
 * Call this BEFORE mounting route handlers in server.js.
 */
export const setupAppIdAuth = (app) => {
  if (!isConfigured()) {
    console.warn('[AppID] IBM App ID not configured. Student/Company IBM login disabled.');
    return;
  }

  app.use(session({
    secret: process.env.SESSION_SECRET || 'campusconnect-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 60 * 1000 }
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));

  const strategy = new WebAppStrategy({
    tenantId: process.env.IBM_APP_ID_TENANT_ID,
    clientId: process.env.IBM_APP_ID_CLIENT_ID,
    secret: process.env.IBM_APP_ID_SECRET,
    oauthServerUrl: process.env.IBM_APP_ID_OAUTH_SERVER_URL,
    redirectUri: redirectUri()
  });

  passport.use(WebAppStrategy.STRATEGY_NAME, strategy);
  console.log(`[AppID] IBM App ID configured. Callback URI: ${redirectUri()}`);
};

const requireConfigured = (req, res, next) => {
  if (!isConfigured()) {
    return res.status(503).json({ message: 'IBM App ID is not configured on the server.' });
  }
  next();
};

/**
 * @route   GET /api/auth/appid/login?role=student|company
 * @desc    Kick off the IBM App ID authorization code flow.
 * @access  Public
 */
router.get(
  '/appid/login',
  requireConfigured,
  (req, res, next) => {
    req.session.appIdRole = req.query.role === 'company' ? 'company' : 'student';
    console.log('[AppID] LOGIN started — role:', req.session.appIdRole);
    console.log('[AppID] successRedirect will be:', AFTER_AUTH_PATH);
    passport.authenticate(WebAppStrategy.STRATEGY_NAME, { successRedirect: AFTER_AUTH_PATH })(req, res, next);
  }
);

/**
 * @route   GET /api/auth/appid/callback
 * @desc    IBM App ID redirects here with ?code=...&state=...
 *          The SDK exchanges the code and the strategy calls this back on
 *          success/failure. No business logic here - provisioning happens in
 *          the `after` route to avoid the SDK's auto-redirect.
 * @access  Public
 */
router.get(
  '/appid/callback',
  requireConfigured,
  (req, res, next) => {
    console.log('[AppID] CALLBACK HIT — code present:', !!req.query.code);
    passport.authenticate(WebAppStrategy.STRATEGY_NAME, (err, user, info) => {
      if (err) {
        console.error('[AppID] CALLBACK ERROR:', err);
        return res.redirect('/api/auth/appid/failure');
      }
      if (!user) {
        console.warn('[AppID] CALLBACK — no user returned, info:', info);
        return res.redirect('/api/auth/appid/failure');
      }
      console.log('[AppID] CALLBACK SUCCESS — manually redirecting to after route');
      // Manually redirect instead of relying on successRedirect (SDK bug workaround)
      res.redirect(AFTER_AUTH_PATH);
    })(req, res, next);
  }
);

/**
 * @route   GET /api/auth/appid/after
 * @desc    Post-login handler. Reads the verified IBM identity, maps it to a
 *          local user (by email), signs our own JWT, and redirects to the
 *          matching role dashboard.
 * @access  Public (only reachable after a successful App ID login)
 */
router.get(AFTER_AUTH_ROUTE, requireConfigured, async (req, res) => {
  console.log('[AppID] AFTER ROUTE HIT!');
  console.log('[AppID] Session keys:', req.session ? Object.keys(req.session) : 'NO SESSION');
  try {
    const authContext = req.session && req.session[WebAppStrategy.AUTH_CONTEXT];
    const claims = (authContext && authContext.identityTokenPayload) || {};
    const identity = Array.isArray(claims.identities) ? claims.identities[0] : null;

    const email = String(
      claims.email || (identity && identity.email) || ''
    ).toLowerCase().trim();
    const name = claims.name || claims.given_name || (identity && identity.displayName) || '';

    if (!email) {
      return res.redirect(`${frontendUrl()}/login?error=appid_noemail`);
    }

    const intentRole = req.session.appIdRole === 'company' ? 'company' : 'student';

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        password: crypto.randomBytes(24).toString('hex'),
        role: intentRole,
        isApproved: intentRole !== 'company'
      });

      if (intentRole === 'student') {
        await Student.create({
          user: user._id,
          fullName: name || 'New Student',
          phone: '',
          education: [],
          skills: [],
          projects: [],
          cgpa: 0
        });
      } else {
        await Company.create({
          user: user._id,
          companyName: name || email.split('@')[0],
          phone: '',
          website: '',
          industry: '',
          description: '',
          status: 'pending'
        });
      }
    } else if (user.role !== intentRole) {
      // The same email already exists under a different role (e.g. a student who
      // previously signed in via the Student Portal now chooses the Recruiter
      // Portal). Honor the portal the user picked: switch the role and ensure the
      // matching profile exists so the JWT role stays in sync with the database
      // (the auth middleware rejects tokens whose role mismatches the record).
      user.role = intentRole;
      user.isApproved = intentRole !== 'company';
      await user.save();

      if (intentRole === 'student') {
        await Student.findOneAndUpdate(
          { user: user._id },
          {
            $setOnInsert: {
              user: user._id,
              fullName: name || 'New Student',
              phone: '',
              education: [],
              skills: [],
              projects: [],
              cgpa: 0
            }
          },
          { upsert: true }
        );
      } else {
        await Company.findOneAndUpdate(
          { user: user._id },
          {
            $setOnInsert: {
              user: user._id,
              companyName: name || email.split('@')[0],
              phone: '',
              website: '',
              industry: '',
              description: '',
              status: 'pending'
            }
          },
          { upsert: true }
        );
      }
    }

    const role = intentRole;
    const token = jwt.sign({ id: user._id, role }, JWT_SECRET, { expiresIn: '30d' });

    const qs = new URLSearchParams({
      token,
      role,
      email: user.email,
      approved: String(user.isApproved)
    });

    res.redirect(`${frontendUrl()}/${role}/dashboard?${qs.toString()}`);
  } catch (error) {
    console.error('[AppID] Post-auth error:', error);
    res.redirect(`${frontendUrl()}/login?error=appid_server`);
  }
});

/**
 * @route   GET /api/auth/appid/failure
 * @desc    Handles failed IBM logins.
 * @access  Public
 */
router.get('/appid/failure', (req, res) => {
  res.redirect(`${frontendUrl()}/login?error=appid_failed`);
});

/**
 * @route   GET /api/auth/appid/logout
 * @desc    Ends the IBM App ID session and returns the user to the login portal.
 * @access  Public
 */
router.get('/appid/logout', requireConfigured, (req, res) => {
  const logoutUrl = WebAppStrategy.getLogoutUrl(
    process.env.IBM_APP_ID_OAUTH_SERVER_URL,
    process.env.IBM_APP_ID_CLIENT_ID,
    `${frontendUrl()}/login`
  );
  if (req.logout) {
    req.logout(() => res.redirect(logoutUrl));
  } else {
    res.redirect(logoutUrl);
  }
});

export default router;
