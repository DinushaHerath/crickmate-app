import React from 'react';
import { useSelector } from 'react-redux';
import AuthStack from './AuthStack';
import PlayerDashboard from './PlayerDashboard';
import GroundOwnerDashboard from './GroundOwnerDashboard';

export default function RootNavigator() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const userRole = useSelector((state) => state.auth.user?.role);

  if (!isAuthenticated) {
    return <AuthStack />;
  }

  // Route to appropriate dashboard based on role
  if (userRole === 'player') {
    return <PlayerDashboard />;
  } else if (userRole === 'ground_owner') {
    return <GroundOwnerDashboard />;
  }

  return <AuthStack />;
}
