// Supabase Configuration
// Replace these with your actual Supabase credentials
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Admin session management
let adminSession = null;

// Check if user is authenticated
async function checkAuth() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (session) {
    adminSession = session;
    return true;
  }
  return false;
}

// Admin login function
async function adminLogin(email, password) {
  try {
    // First verify against admin_users table
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (adminError || !adminUser) {
      return { success: false, error: 'Invalid credentials' };
    }
    
    // In production, use proper password hashing
    if (adminUser.password_hash !== password) {
      return { success: false, error: 'Invalid credentials' };
    }
    
    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    
    if (error) {
      // If Supabase Auth not configured, just set session manually
      adminSession = { user: { email: email } };
      return { success: true };
    }
    
    adminSession = data.session;
    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
}

// Admin logout function
async function adminLogout() {
  try {
    await supabase.auth.signOut();
    adminSession = null;
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: error.message };
  }
}

// Check if user has admin privileges
function isAdmin() {
  return adminSession !== null;
}
