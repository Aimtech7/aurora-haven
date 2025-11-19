# Admin Login Credentials

## Default Admin Account

To access the admin dashboard, you need to:

1. **Create an admin account** in your Supabase database
2. **Assign the admin role** to the user

### Step 1: Create Admin User

First, sign up a user account through Supabase Auth. You can do this via SQL:

```sql
-- This is just an example - you should create your own admin user
-- through the Supabase Auth UI or using the SQL below

-- Note: You'll need to replace 'your-secure-password' with a strong password
-- and 'admin@survivorhub.com' with your preferred admin email
```

### Step 2: Assign Admin Role

After creating the user, get their user ID and run this SQL in your Supabase SQL editor:

```sql
-- Get the user ID first
SELECT id, email FROM auth.users WHERE email = 'admin@survivorhub.com';

-- Then insert the admin role (replace 'USER_ID_HERE' with actual user ID)
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID_HERE', 'admin');
```

### Example Setup (For Testing Only - Change Credentials!)

For initial testing purposes, you can create an admin account with:

**Email:** `admin@survivorhub.com`  
**Password:** `Admin@123456` (⚠️ **CHANGE THIS IMMEDIATELY** after first login!)

**CRITICAL SECURITY WARNING:**
- Never use default credentials in production
- Always use strong, unique passwords
- Enable email confirmation in production
- Implement 2FA for admin accounts
- Regularly rotate admin credentials
- Monitor admin access logs

### Production Setup Checklist

Before deploying to production:

- [ ] Create a secure admin email address
- [ ] Generate a strong password (min 16 characters, mixed case, numbers, symbols)
- [ ] Assign admin role via SQL
- [ ] Test admin login
- [ ] Enable email confirmation in Supabase Auth settings
- [ ] Set up 2FA if available
- [ ] Delete this file or move it to secure storage
- [ ] Document credentials in password manager
- [ ] Set up admin access monitoring

### Accessing Admin Dashboard

1. Navigate to: `https://your-domain.com/admin/login`
2. Enter admin email and password
3. You'll be redirected to `/admin/dashboard` upon successful login

### Security Notes

- Only users with the 'admin' role in the `user_roles` table can access the dashboard
- All admin actions are protected by Row Level Security (RLS) policies
- Unauthorized users are automatically redirected to the login page
- Sessions are managed securely by Supabase Auth
- Admin access is verified on every sensitive operation

### Troubleshooting

**Can't login?**
1. Verify the user exists in `auth.users`
2. Check the user has 'admin' role in `user_roles` table
3. Ensure email is confirmed (or disable email confirmation)
4. Check browser console for error messages

**"Unauthorized" error after login?**
- The user doesn't have the admin role assigned
- Run the SQL query above to assign the admin role

### Managing Multiple Admins

To add more admin users:

```sql
-- Create admin role for existing user
INSERT INTO public.user_roles (user_id, role)
VALUES ('another-user-id-here', 'admin');

-- Remove admin role
DELETE FROM public.user_roles 
WHERE user_id = 'user-id-here' AND role = 'admin';
```

---

**Remember:** Keep these credentials secure and never commit them to public repositories!
