import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'member' | 'coach';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

const TEST_ACCOUNTS = {
  'member@gym.com': {
    id: 'member1',
    email: 'member@gym.com',
    password: '123456789',
    name: 'John Member',
    role: 'member' as const,
  },
  'coach@gym.com': {
    id: 'coach1',
    email: 'coach@gym.com',
    password: '123456789',
    name: 'Coach Sarah',
    role: 'coach' as const,
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('gym-app-user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('gym-app-user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const account = TEST_ACCOUNTS[email as keyof typeof TEST_ACCOUNTS];
    
    if (account && account.password === password) {
      const userInfo: User = {
        id: account.id,
        email: account.email,
        name: account.name,
        role: account.role,
      };
      
      setUser(userInfo);
      localStorage.setItem('gym-app-user', JSON.stringify(userInfo));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gym-app-user');
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

