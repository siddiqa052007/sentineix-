import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, ActivityLog } from '../types';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  company: string;
  employeeId: string;
  role?: UserRole;
  profilePicture?: string;
}

interface AuthContextType {
  currentUser: User | null;
  token: string | null;
  isLoading: boolean;
  register: (data: RegisterData) => Promise<{ success: boolean; message: string; status?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; user?: User; token?: string; status?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User> & { password?: string }) => Promise<{ success: boolean; message: string; user?: User }>;
  
  // Super Admin functions
  users: User[];
  activityLogs: ActivityLog[];
  fetchUsers: () => Promise<void>;
  fetchActivityLogs: () => Promise<void>;
  approveUser: (userId: string) => Promise<{ success: boolean; message: string }>;
  rejectUser: (userId: string) => Promise<{ success: boolean; message: string }>;
  suspendUser: (userId: string) => Promise<{ success: boolean; message: string }>;
  reactivateUser: (userId: string) => Promise<{ success: boolean; message: string }>;
  deleteUser: (userId: string) => Promise<{ success: boolean; message: string }>;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getLocalUsers = (): any[] => {
  try {
    const raw = localStorage.getItem('sentinelx_local_users');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalUsers = (users: any[]) => {
  try {
    localStorage.setItem('sentinelx_local_users', JSON.stringify(users));
  } catch {}
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('sentinelx_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<User[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Helper to safely parse JSON response
  const parseJsonResponse = async (res: Response) => {
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await res.json();
    }
    return null;
  };

  // Verify token on mount or token change
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setCurrentUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await parseJsonResponse(res);
          if (data && data.user) {
            setCurrentUser(data.user);
          } else {
            setCurrentUser(null);
          }
        } else {
          // Check local backup user token
          const parts = token.split(':::');
          const userId = parts[1] || parts[0];
          const localUsers = getLocalUsers();
          const localMatch = localUsers.find(u => u.id === userId);
          if (localMatch) {
            const { password: _, ...userWithoutPassword } = localMatch;
            setCurrentUser(userWithoutPassword as User);
          } else {
            localStorage.removeItem('sentinelx_token');
            setToken(null);
            setCurrentUser(null);
          }
        }
      } catch (err) {
        console.error('Error verifying auth token:', err);
        const parts = token.split(':::');
        const userId = parts[1] || parts[0];
        const localUsers = getLocalUsers();
        const localMatch = localUsers.find(u => u.id === userId);
        if (localMatch) {
          const { password: _, ...userWithoutPassword } = localMatch;
          setCurrentUser(userWithoutPassword as User);
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  // Fetch users if super admin
  const fetchUsers = async () => {
    if (!token || currentUser?.role !== 'Super Admin') return;
    try {
      const res = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await parseJsonResponse(res);
        if (data && data.users) {
          setUsers(data.users);
        }
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  // Fetch activity logs if super admin
  const fetchActivityLogs = async () => {
    if (!token || currentUser?.role !== 'Super Admin') return;
    try {
      const res = await fetch('/api/admin/activity-logs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await parseJsonResponse(res);
        if (data && data.logs) {
          setActivityLogs(data.logs);
        }
      }
    } catch (err) {
      console.error('Error fetching activity logs:', err);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'Super Admin') {
      fetchUsers();
      fetchActivityLogs();
    }
  }, [currentUser]);

  const register = async (data: RegisterData) => {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanPassword = data.password;

    // Email domain validation (e.g. must end with .com, .org, etc.)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(cleanEmail)) {
      return {
        success: false,
        message: 'Please enter a valid email address with a proper domain extension (e.g., name@gmail.com).'
      };
    }

    // Password requirements: 8+ chars, 1 number, 1 special char
    if (cleanPassword.length < 8 || !/\d/.test(cleanPassword) || !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(cleanPassword)) {
      return { success: false, message: 'Password must be at least 8 characters long, contain at least one number, and contain at least one special character.' };
    }

    const localUsers = getLocalUsers();
    const localMatch = localUsers.find(u => u.email.trim().toLowerCase() === cleanEmail);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          email: cleanEmail,
          password: cleanPassword
        })
      });

      const json = await parseJsonResponse(res) || {};
      if (!res.ok) {
        if (json.error?.toLowerCase().includes('already exists') || localMatch) {
          return {
            success: false,
            message: 'An account with this email address already exists. Please log in instead.',
            status: 'Existing'
          };
        }
        return { success: false, message: json.error || 'Registration failed.', status: json.status };
      }

      // Sync local cache
      const newUserRecord = {
        id: json.user?.id || 'usr_' + Date.now(),
        name: data.name.trim(),
        email: cleanEmail,
        password: cleanPassword,
        company: data.company,
        employeeId: data.employeeId,
        role: data.role || 'Security Analyst',
        status: 'Approved',
        profilePicture: data.profilePicture || ''
      };
      if (!localMatch) {
        localUsers.push(newUserRecord);
        saveLocalUsers(localUsers);
      }

      return {
        success: true,
        message: json.message || 'Registration successful! Your account is ready. Please sign in.',
        status: json.status || 'Approved'
      };
    } catch (err: any) {
      if (localMatch) {
        return {
          success: false,
          message: 'An account with this email address already exists. Please log in instead.',
          status: 'Existing'
        };
      }
      const newUserRecord = {
        id: 'usr_' + Date.now(),
        name: data.name.trim(),
        email: cleanEmail,
        password: cleanPassword,
        company: data.company,
        employeeId: data.employeeId,
        role: data.role || 'Security Analyst',
        status: 'Approved',
        profilePicture: data.profilePicture || ''
      };
      localUsers.push(newUserRecord);
      saveLocalUsers(localUsers);

      return {
        success: true,
        message: 'Registration successful! Your account is ready. Please sign in.',
        status: 'Approved'
      };
    }
  };

  const login = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;

    // Email domain validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(cleanEmail)) {
      return {
        success: false,
        message: 'Please enter a valid email address with a proper domain extension (e.g., name@gmail.com).'
      };
    }

    // Password requirements validation
    if (cleanPassword.length < 8 || !/\d/.test(cleanPassword) || !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(cleanPassword)) {
      return {
        success: false,
        message: 'Password must be at least 8 characters long, contain at least one number, and contain at least one special character.'
      };
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
      });

      const json = await parseJsonResponse(res);

      if (!res.ok) {
        // Local fallback check
        const localUsers = getLocalUsers();
        const localMatch = localUsers.find(u => u.email.trim().toLowerCase() === cleanEmail);
        if (localMatch && localMatch.password === cleanPassword) {
          const mockToken = `mock_jwt:::${localMatch.id}:::${Date.now()}`;
          const { password: _, ...userWithoutPassword } = localMatch;
          localStorage.setItem('sentinelx_token', mockToken);
          setToken(mockToken);
          setCurrentUser(userWithoutPassword as User);
          return {
            success: true,
            message: 'Authentication successful.',
            user: userWithoutPassword as User,
            token: mockToken,
            status: 'Approved'
          };
        }

        if (!localMatch) {
          return {
            success: false,
            message: (json && json.error) ? json.error : 'This email is not registered.',
            status: json ? json.status : undefined
          };
        }

        if (localMatch.password !== cleanPassword) {
          return {
            success: false,
            message: (json && json.error) ? json.error : 'Password is wrong.',
            status: json ? json.status : undefined
          };
        }

        return {
          success: false,
          message: (json && json.error) ? json.error : 'This email is not registered.',
          status: json ? json.status : undefined
        };
      }

      // Sync local cache
      const localUsers = getLocalUsers();
      if (!localUsers.some(u => u.email.trim().toLowerCase() === cleanEmail)) {
        localUsers.push({
          ...json.user,
          email: cleanEmail,
          password: cleanPassword
        });
        saveLocalUsers(localUsers);
      }

      // Login success
      localStorage.setItem('sentinelx_token', json.token);
      setToken(json.token);
      setCurrentUser(json.user);

      return {
        success: true,
        message: 'Authentication successful.',
        user: json.user,
        token: json.token,
        status: json.user.status
      };
    } catch (err: any) {
      const localUsers = getLocalUsers();
      const localMatch = localUsers.find(u => u.email.trim().toLowerCase() === cleanEmail);
      if (localMatch && localMatch.password === cleanPassword) {
        const mockToken = `mock_jwt:::${localMatch.id}:::${Date.now()}`;
        const { password: _, ...userWithoutPassword } = localMatch;
        localStorage.setItem('sentinelx_token', mockToken);
        setToken(mockToken);
        setCurrentUser(userWithoutPassword as User);
        return {
          success: true,
          message: 'Authentication successful.',
          user: userWithoutPassword as User,
          token: mockToken,
          status: 'Approved'
        };
      }

      if (!localMatch) {
        return { success: false, message: 'This email is not registered.' };
      }
      if (localMatch.password !== cleanPassword) {
        return { success: false, message: 'Password is wrong.' };
      }

      return { success: false, message: 'This email is not registered.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('sentinelx_token');
    setToken(null);
    setCurrentUser(null);
  };

  const updateProfile = async (data: Partial<User> & { password?: string }) => {
    if (!token) return { success: false, message: 'Not authenticated.' };

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const json = await res.json();
      if (!res.ok) {
        return { success: false, message: json.error || 'Failed to update profile.' };
      }

      setCurrentUser(json.user);
      return { success: true, message: 'Profile updated successfully.', user: json.user };
    } catch (err: any) {
      return { success: false, message: err.message || 'Error updating profile.' };
    }
  };

  const approveUser = async (userId: string) => {
    if (!token) return { success: false, message: 'Unauthorized' };
    try {
      const res = await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok) {
        await fetchUsers();
        await fetchActivityLogs();
        return { success: true, message: json.message || 'Account approved.' };
      }
      return { success: false, message: json.error || 'Failed to approve.' };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const rejectUser = async (userId: string) => {
    if (!token) return { success: false, message: 'Unauthorized' };
    try {
      const res = await fetch(`/api/admin/users/${userId}/reject`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok) {
        await fetchUsers();
        await fetchActivityLogs();
        return { success: true, message: json.message || 'Account rejected.' };
      }
      return { success: false, message: json.error || 'Failed to reject.' };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const suspendUser = async (userId: string) => {
    if (!token) return { success: false, message: 'Unauthorized' };
    try {
      const res = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok) {
        await fetchUsers();
        await fetchActivityLogs();
        return { success: true, message: json.message || 'Account suspended.' };
      }
      return { success: false, message: json.error || 'Failed to suspend.' };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const reactivateUser = async (userId: string) => {
    if (!token) return { success: false, message: 'Unauthorized' };
    try {
      const res = await fetch(`/api/admin/users/${userId}/reactivate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok) {
        await fetchUsers();
        await fetchActivityLogs();
        return { success: true, message: json.message || 'Account reactivated.' };
      }
      return { success: false, message: json.error || 'Failed to reactivate.' };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const deleteUser = async (userId: string) => {
    if (!token) return { success: false, message: 'Unauthorized' };
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok) {
        await fetchUsers();
        await fetchActivityLogs();
        return { success: true, message: json.message || 'Account deleted.' };
      }
      return { success: false, message: json.error || 'Failed to delete user.' };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    if (!token) return { success: false, message: 'Unauthorized' };
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      const json = await res.json();
      if (res.ok) {
        await fetchUsers();
        await fetchActivityLogs();
        return { success: true, message: json.message || 'User role updated.' };
      }
      return { success: false, message: json.error || 'Failed to update role.' };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        isLoading,
        register,
        login,
        logout,
        updateProfile,
        users,
        activityLogs,
        fetchUsers,
        fetchActivityLogs,
        approveUser,
        rejectUser,
        suspendUser,
        reactivateUser,
        deleteUser,
        updateUserRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
