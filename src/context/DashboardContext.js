// context/DashboardContext.js
"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const DashboardContext = createContext();

export function DashboardProvider({ children }) {
  const { data: session, status } = useSession();
  const [ownerData, setOwnerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    todayOrders: 0
  });

  // Fetch owner-specific data when session changes
  useEffect(() => {
    if (status === 'loading') return;
    
    if (session?.user?._id) {
      fetchOwnerData();
      fetchDashboardStats();
    } else {
      setLoading(false);
    }
  }, [session, status]);

  const fetchOwnerData = async () => {
    try {
      const response = await fetch('/api/owner/profile');
      const data = await response.json();
      
      if (data.success) {
        setOwnerData(data.owner);
      }
    } catch (error) {
      console.error('Error fetching owner data:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchOwnerData();
    fetchDashboardStats();
  };

  const value = {
    owner: ownerData,
    stats,
    loading,
    refreshData,
    isAuthenticated: !!session?.user?._id,
    ownerId: session?.user?._id
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};