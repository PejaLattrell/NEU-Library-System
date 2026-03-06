# Sprint 4 Security & Moderation - Setup Guide

## Overview
This sprint implements security controls to manage library access through a blocking system. Only admins can block/unblock users.

## What's Implemented

### 1. isBlocked Field ✅
- Added to all users in Firestore users collection
- Default: `false` (not blocked)
- Set by admin via Admin Dashboard

### 2. Admin Block/Unblock Controls ✅
- Located in Admin Dashboard visitor table
- Each user row has a Block/Unblock button
- Blocking/unblocking is instant and updates Firestore
- Blocked users show "Blocked" status badge (red)

### 3. Login Security Check ✅
- When user logs in, system checks `isBlocked` field
- If blocked: Shows error "Access Denied. Please contact the Library Admin."
- Automatically signs out blocked user
- Prevents access to any dashboard

### 4. Firebase Security Rules (Manual Setup Required)
Security rules file is at: `firestore.rules`

**To Deploy Rules to Firebase:**

#### Option A: Using Firebase CLI
```bash
cd "C:\Users\User\OneDrive\Desktop\Dev Projects\NEU Library System"
firebase deploy --only firestore:rules
```

#### Option B: Manual Setup via Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your NEU Library project
3. Go to **Firestore Database** → **Rules** tab
4. Copy and paste the content from `firestore.rules` file
5. Click **Publish**

### 5. Admin Custom Claims (Optional Enhancement)
For extra security, you can set custom claims on admin users:

```javascript
// This would be done via Firebase Admin SDK on a backend
admin.auth().setCustomUserClaims(adminUID, { isAdmin: true });
```

However, the current role-based system in your code is sufficient.

## How to Use the Blocking Feature

### Block a User:
1. Log in as admin (admin email in `adminConfig.js`)
2. Go to Admin Dashboard
3. Find the user in the visitor list
4. Click the **Block** button in the Action column
5. Confirmation message appears
6. User's status changes to "Blocked" (red badge)

### Unblock a User:
1. Find the blocked user in the visitor list
2. Click the **Unblock** button
3. Status changes back to "Active" (green badge)

### What Happens When User is Blocked:
1. User tries to log in
2. System checks `isBlocked` field
3. Shows error: "Access Denied. Please contact the Library Admin."
4. User is automatically logged out
5. User cannot proceed to dashboard or check-in

## Security Layers

| Layer | Implementation | Status |
|-------|-----------------|--------|
| Frontend Validation | Login checks isBlocked before routing | ✅ |
| Role-Based Access | ProtectedRoute ensures only users/admins access respective pages | ✅ |
| Database Rules | Firebase Security Rules enforce blocking at data level | ⚠️ Deploy Manually |
| Admin Controls | Only admin role can block/unblock users | ✅ |
| Audit Trail | Blocked/unblocked timestamp recorded in Firestore | ✅ |

## Testing

### Test Case 1: Blocking a User
```
1. User A logs in successfully → sees user dashboard
2. Admin logs in → goes to admin dashboard
3. Admin blocks User A
4. User A refreshes page → sees "Access Denied" message
5. User A cannot access any other pages
```

### Test Case 2: Unblocking a User
```
1. User A is blocked
2. Admin unblocks User A
3. User A logs in → sees user dashboard (works again)
```

### Test Case 3: Manual URL Access
```
1. Regular user tries to access /admin directly → redirected to login
2. Blocked user tries to access /dashboard directly → redirected to login
```

## Files Modified

- `src/pages/Login.jsx` - Added blocking check
- `src/pages/AdminDashboard.jsx` - Added Block/Unblock buttons
- `src/services/userService.js` - Added blockUser(), unblockUser() functions
- `src/components/ProtectedRoute.jsx` - Role-based access control
- `firestore.rules` - Security rules (NEW - requires manual deployment)

## Next Steps

1. **Deploy Security Rules** (if using Firebase CLI)
2. **Test Blocking Feature** with test accounts
3. **Monitor Firestore** for blocked user attempts (visible in logs)
4. **(Optional) Create Audit Log Dashboard** to track all blocking actions

## Troubleshooting

### User can still access page after being blocked
- Clear browser cache and cookies
- User may need to log out manually
- Check Firestore to verify `isBlocked` is true

### Admin Dashboard Block button not working
- Verify admin email is in `src/config/adminConfig.js`
- Check browser console for errors
- Ensure Firestore has write permissions for admin

### Custom Claims not working
- If using custom claims, ensure they're set via Admin SDK
- Token refresh might be needed (sign in again)
- Current role-based system doesn't require custom claims

---

**Created**: March 6, 2026  
**Sprint**: Sprint 4 - Security & Moderation
