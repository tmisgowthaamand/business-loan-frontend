import { useAuth } from '../context/AuthContext';

interface StaffPermissions {
  canManageStaff: boolean;
  canViewAllData: boolean;
  canCreateStaff: boolean;
  canDeleteStaff: boolean;
  canModifyStaff: boolean;
  canViewStaffList: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

export const useStaffPermissions = (): StaffPermissions => {
  const { user } = useAuth();

  // Only admin@gmail.com has full staff management permissions
  const isSuperAdmin = user?.email === 'admin@gmail.com';
  const isAdmin = user?.role === 'ADMIN';

  return {
    // Staff management permissions - only for admin@gmail.com
    canManageStaff: isSuperAdmin,
    canCreateStaff: isSuperAdmin,
    canDeleteStaff: isSuperAdmin,
    canModifyStaff: isSuperAdmin,
    canViewStaffList: isSuperAdmin,
    
    // Data access permissions
    canViewAllData: isSuperAdmin, // Only admin@gmail.com sees all data
    
    // Role flags
    isAdmin,
    isSuperAdmin
  };
};

export default useStaffPermissions;
