import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield, ArrowLeft, Search, Download, Trash2, Eye, EyeOff,
  UserCheck, AlertTriangle, CheckCircle2, Key, Users, RefreshCw, X, Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StorageService, hashPassword } from '../services/storage';
import { User, UserRole } from '../types';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, isAdmin } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<User | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New user modal
  const [createUserModalOpen, setCreateUserModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('user');

  // Strictly enforce admin protection
  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { replace: true });
    } else if (currentUser.role !== 'admin') {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setUsers(StorageService.getUsers());
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteUser = (userId: string, userEmail: string) => {
    if (currentUser?.id === userId || userEmail.toLowerCase() === 'owaiskhanmmd1@gmail.com') {
      showToast("Cannot delete system administrator account!", 'error');
      return;
    }

    if (window.confirm(`Are you sure you want to permanently delete user "${userEmail}"?`)) {
      const success = StorageService.deleteUser(userId);
      if (success) {
        showToast("User deleted successfully.");
        loadUsers();
      } else {
        showToast("Failed to delete user.", 'error');
      }
    }
  };

  const handleRoleToggle = (userId: string, currentRole: UserRole, userEmail: string) => {
    if (userEmail.toLowerCase() === 'owaiskhanmmd1@gmail.com') {
      showToast("System administrator role cannot be altered.", 'error');
      return;
    }

    const nextRole: UserRole = currentRole === 'admin' ? 'user' : 'admin';
    const ok = StorageService.updateUserRole(userId, nextRole);
    if (ok) {
      showToast(`User role changed to ${nextRole}`);
      loadUsers();
    }
  };

  const handleShowOriginalPassword = (user: User) => {
    setSelectedUserForPassword(user);
    // Also trigger standard browser alert as requested in prompt requirement
    // "with 'Show Original' eye button that decodes and shows alert (for demo)"
    alert(`🔐 Original Password for ${user.name} (${user.email}):\n\n${user.originalPassword || 'Not recorded (Default Demo: Owe@1122 or 123456)'}`);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUsername.trim() || !newEmail.trim() || !newPassword) {
      showToast("Please fill all required fields", "error");
      return;
    }

    if (StorageService.getUserByEmail(newEmail.trim())) {
      showToast("Email is already taken", "error");
      return;
    }

    if (StorageService.getUserByUsername(newUsername.trim())) {
      showToast("Username is already taken", "error");
      return;
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      name: newName.trim(),
      username: newUsername.trim().toLowerCase(),
      email: newEmail.trim().toLowerCase(),
      password: hashPassword(newPassword),
      originalPassword: newPassword,
      role: newRole,
      createdAt: new Date().toISOString(),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
    };

    StorageService.saveUser(newUser);
    showToast(`New user "${newName}" created successfully!`);
    setCreateUserModalOpen(false);
    setNewName('');
    setNewUsername('');
    setNewEmail('');
    setNewPassword('');
    setNewRole('user');
    loadUsers();
  };

  const handleExportCSV = () => {
    const headers = ["Index", "Name", "Username", "Email", "Password_Hashed", "Password_Original", "Role", "Created_At"];
    const rows = users.map((u, idx) => [
      idx + 1,
      `"${u.name.replace(/"/g, '""')}"`,
      `"${u.username}"`,
      `"${u.email}"`,
      `"${u.password}"`,
      `"${(u.originalPassword || '').replace(/"/g, '""')}"`,
      u.role,
      `"${new Date(u.createdAt).toISOString()}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `facebook_users_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV exported successfully!");
  };

  const filteredUsers = users.filter(u => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const totalAdmins = users.filter(u => u.role === 'admin').length;
  const totalRegular = users.filter(u => u.role === 'user').length;

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans text-gray-900 pb-16">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-xl border flex items-center gap-2.5 text-sm font-semibold animate-in fade-in slide-in-from-top-3 ${
          toastMessage.type === 'success' ? 'bg-green-50 border-green-300 text-green-800' : 'bg-red-50 border-red-300 text-red-800'
        }`}>
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <AlertTriangle className="w-5 h-5 text-red-600" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Header Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#1877F2] text-white flex items-center justify-center font-bold">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-tight">Admin Panel - User Management</h1>
                <p className="text-xs text-gray-500">Security, accounts, and encrypted credentials</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg text-xs font-semibold transition cursor-pointer shadow-2xs"
            >
              <Download className="w-4 h-4 text-gray-500" />
              <span>Export to CSV</span>
            </button>

            <Link
              to="/dashboard"
              className="px-4 py-2 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-lg text-xs font-bold transition shadow-xs"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 pt-6 space-y-6">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Users</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{users.length}</h3>
              <p className="text-xs text-green-600 mt-1 font-medium">Active in database</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1877F2] flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Administrators</p>
              <h3 className="text-2xl font-bold text-purple-700 mt-1">{totalAdmins}</h3>
              <p className="text-xs text-gray-500 mt-1">Full privileged access</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Standard Users</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalRegular}</h3>
              <p className="text-xs text-gray-500 mt-1">Feed & social access</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Storage Engine</p>
              <h3 className="text-lg font-bold text-gray-900 mt-1">Bcrypt + LocalStorage</h3>
              <p className="text-xs text-blue-600 mt-1 font-medium">10 Salt Rounds Active</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Key className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* User Management Table Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          
          {/* Card Controls Bar */}
          <div className="p-4 sm:p-5 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search users by name, username, email..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1877F2]/30 focus:border-[#1877F2]"
              />
              {searchFilter && (
                <button
                  onClick={() => setSearchFilter('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => setCreateUserModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#42b72a] hover:bg-[#36a420] text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add User
              </button>

              <button
                onClick={loadUsers}
                className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition"
                title="Reload"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-100/70 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Password (Encrypted)</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Created At</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500 font-medium">
                      No matching users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, idx) => {
                    const isSelf = currentUser?.id === user.id;
                    const isSystemAdmin = user.email.toLowerCase() === 'owaiskhanmmd1@gmail.com';

                    return (
                      <tr key={user.id} className="hover:bg-gray-50 transition">
                        
                        {/* # */}
                        <td className="py-3 px-4 text-center text-gray-400 font-mono font-medium">
                          {idx + 1}
                        </td>

                        {/* Name */}
                        <td className="py-3 px-4 font-bold text-gray-900">
                          <div className="flex items-center gap-2">
                            <img
                              src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                              alt={user.name}
                              className="w-7 h-7 rounded-full object-cover border border-gray-200"
                            />
                            <span>{user.name}</span>
                            {isSelf && (
                              <span className="text-[10px] text-blue-600 font-normal bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                                You
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Username */}
                        <td className="py-3 px-4 text-gray-600 font-mono">
                          @{user.username}
                        </td>

                        {/* Email */}
                        <td className="py-3 px-4 text-gray-700 font-medium">
                          {user.email}
                        </td>

                        {/* Password (Encrypted) with Show Original eye button */}
                        <td className="py-3 px-4 font-mono">
                          <div className="flex items-center gap-2">
                            <span
                              className="max-w-[130px] truncate block text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 select-all"
                              title={user.password}
                            >
                              {user.password.slice(0, 15)}...
                            </span>
                            
                            {/* "Show Original" Eye Button as specified */}
                            <button
                              type="button"
                              onClick={() => handleShowOriginalPassword(user)}
                              className="flex items-center gap-1 text-[11px] font-semibold text-[#1877F2] hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 transition cursor-pointer"
                              title="Show Original Password (Demo)"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Show Original</span>
                            </button>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            disabled={isSystemAdmin}
                            onClick={() => handleRoleToggle(user.id, user.role, user.email)}
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full uppercase transition ${
                              user.role === 'admin'
                                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                            } ${isSystemAdmin ? 'cursor-default' : 'cursor-pointer hover:opacity-80'}`}
                            title={isSystemAdmin ? "System admin role locked" : "Click to toggle role"}
                          >
                            {user.role === 'admin' ? <Shield className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                            {user.role}
                          </button>
                        </td>

                        {/* Created At */}
                        <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                          {new Date(user.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>

                        {/* Action: Delete */}
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            disabled={isSelf || isSystemAdmin}
                            onClick={() => handleDeleteUser(user.id, user.email)}
                            className={`p-1.5 rounded-md transition ${
                              isSelf || isSystemAdmin
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer'
                            }`}
                            title={isSelf ? "Cannot delete yourself" : isSystemAdmin ? "Cannot delete main admin" : "Delete user"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
            <span>Showing {filteredUsers.length} of {users.length} registered accounts</span>
            <span className="text-[11px]">Click "Show Original" to reveal demo decoded passwords</span>
          </div>
        </div>

        {/* Password Inspection Modal (Optional visual addition to browser alert) */}
        {selectedUserForPassword && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95">
              <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-blue-50">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#1877F2]" /> Password Inspection Details
                </h3>
                <button
                  onClick={() => setSelectedUserForPassword(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <span className="text-xs text-gray-500 font-medium block">User</span>
                  <p className="font-bold text-gray-900">{selectedUserForPassword.name} ({selectedUserForPassword.email})</p>
                </div>

                <div>
                  <span className="text-xs text-gray-500 font-medium block">Encrypted Bcrypt Hash</span>
                  <div className="bg-gray-100 p-2.5 rounded-md font-mono text-[11px] text-gray-700 break-all border border-gray-200 select-all">
                    {selectedUserForPassword.password}
                  </div>
                </div>

                <div>
                  <span className="text-xs text-gray-500 font-medium block">Decoded / Original Password (Demo)</span>
                  <div className="bg-green-50 border border-green-200 p-2.5 rounded-md font-mono text-sm font-bold text-green-800 select-all">
                    {selectedUserForPassword.originalPassword || 'Owe@1122'}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedUserForPassword(null)}
                  className="w-full py-2 bg-[#1877F2] text-white font-bold rounded-lg text-sm transition hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add User Modal */}
        {createUserModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95">
              <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                <h3 className="font-bold text-gray-800">Add New User to Database</h3>
                <button
                  onClick={() => setCreateUserModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="p-5 space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rachel Green"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1877F2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="rachel_g"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1877F2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="rachel@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1877F2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1877F2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1877F2] bg-white"
                  >
                    <option value="user">Standard User</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setCreateUserModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#42b72a] hover:bg-[#36a420] text-white font-bold rounded-lg text-xs"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
