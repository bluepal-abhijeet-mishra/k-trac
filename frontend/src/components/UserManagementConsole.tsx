import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, LayoutDashboard, Users, Container, BarChart2, Settings, HelpCircle, Search, Bell, UserCircle, ChevronRight, Plus, Edit2, Ban, ChevronLeft, Loader2 } from 'lucide-react';
import { usersApi } from '../api/users';

const SidebarItem = ({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
  <div className={`flex items-center gap-3 px-6 py-3 cursor-pointer ${active ? 'bg-secondary text-white' : 'text-gray-400 hover:text-white'}`}>
    <Icon size={20} />
    <span className="font-medium text-sm">{label}</span>
  </div>
);

interface UserManagementConsoleProps {
  onProvisionClick?: () => void;
}

export const UserManagementConsole = ({ onProvisionClick }: UserManagementConsoleProps) => {
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['users', page, pageSize],
    queryFn: () => usersApi.getUsers(page, pageSize),
  });

  const deactivateMutation = useMutation({
    mutationFn: usersApi.deactivateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: any) => {
      alert(`Failed to deactivate user: ${err.message}`);
    }
  });

  const handleDeactivate = (id: string) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      deactivateMutation.mutate(id);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-sidebar flex flex-col">
        <div className="h-20 flex items-center px-6 gap-3">
          <div className="bg-black p-1.5 rounded text-white">
            <Shield size={24} />
          </div>
          <div>
            <div className="text-white font-bold text-xl leading-tight">K-TRAC</div>
            <div className="text-gray-400 text-xs">Industrial Tracking</div>
          </div>
        </div>

        <div className="flex-1 py-4 flex flex-col gap-1">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem icon={Users} label="User Management" active />
          <SidebarItem icon={Container} label="Asset Control" />
          <SidebarItem icon={BarChart2} label="Reports" />
        </div>

        <div className="py-4 border-t border-gray-800 flex flex-col gap-1">
          <SidebarItem icon={Settings} label="Settings" />
          <SidebarItem icon={HelpCircle} label="Support" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-6 text-sm">
            <span className="text-gray-600 font-medium">Overview</span>
            <span className="text-gray-600 font-medium">History</span>
            <span className="text-gray-600 font-medium">Logs</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search K-TRAC..."
                className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
              />
            </div>
            <button className="bg-black text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-gray-800">
              Add Asset
            </button>
            <div className="flex items-center gap-3 text-gray-500 border-l border-gray-200 pl-4">
              <Bell size={20} className="cursor-pointer hover:text-black" />
              <UserCircle size={20} className="cursor-pointer hover:text-black" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumbs & Title */}
            <div className="mb-6 flex justify-between items-end">
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <span>K-TRAC</span>
                  <ChevronRight size={14} />
                  <span className="text-black font-medium">User Management</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              </div>
              <button
                onClick={onProvisionClick}
                className="bg-black text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                <Plus size={16} />
                Provision New User
              </button>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded border border-gray-200 shadow-sm">
              {/* Toolbar */}
              <div className="p-4 border-b border-gray-200 flex gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                  />
                </div>
                <div className="flex gap-2">
                  <select className="px-3 py-2 border border-gray-200 rounded text-sm text-gray-700 bg-white min-w-[120px] focus:outline-none focus:border-secondary">
                    <option>Role: All</option>
                  </select>
                  <select className="px-3 py-2 border border-gray-200 rounded text-sm text-gray-700 bg-white min-w-[120px] focus:outline-none focus:border-secondary">
                    <option>Zone: All</option>
                  </select>
                  <select className="px-3 py-2 border border-gray-200 rounded text-sm text-gray-700 bg-white min-w-[120px] focus:outline-none focus:border-secondary">
                    <option>Shed ID: All</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto min-h-[300px]">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <Loader2 className="animate-spin mb-4 text-secondary" size={32} />
                    <p>Loading users...</p>
                  </div>
                ) : isError ? (
                  <div className="flex flex-col items-center justify-center h-64 text-red-500">
                    <p>Failed to load users: {error instanceof Error ? error.message : 'Unknown error'}</p>
                  </div>
                ) : (
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 font-semibold">Username</th>
                        <th className="px-6 py-3 font-semibold">Email</th>
                        <th className="px-6 py-3 font-semibold">Role</th>
                        <th className="px-6 py-3 font-semibold">Zone</th>
                        <th className="px-6 py-3 font-semibold">Shed ID</th>
                        <th className="px-6 py-3 font-semibold">Status</th>
                        <th className="px-6 py-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.content?.map((user) => {
                        // Determine display role for pill styling. In a real app, this might come from a user's primary role or similar logic.
                        // Assuming the backend might return roles as strings like 'ADMIN', 'OPERATOR', etc., or it might need mapping.
                        // For now we map based on some basic heuristics or just display standard format.
                        return (
                          <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                            <td className="px-6 py-4 font-medium text-gray-900">{user.username}</td>
                            <td className="px-6 py-4 text-gray-500">{user.email}</td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 rounded-full text-xs font-medium border bg-gray-100 text-gray-800 border-gray-200">
                                {/* Normally extract role here if present in the data structure we mapped. Assuming it might not be in the base User model directly yet, or we'd add it. */}
                                Standard
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-600">-</td>
                            <td className="px-6 py-4 font-mono text-xs text-gray-600">{user.homeLocationId || '-'}</td>
                            <td className="px-6 py-4">
                              <div
                                onClick={() => user.isActive && handleDeactivate(user.id)}
                                className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${user.isActive ? 'bg-secondary' : 'bg-gray-300'}`}
                              >
                                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${user.isActive ? 'left-5' : 'left-0.5'}`}></div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-end gap-3 text-gray-400">
                                <button className="hover:text-gray-900 transition-colors" title="Edit"><Edit2 size={16} /></button>
                                <button
                                  onClick={() => user.isActive && handleDeactivate(user.id)}
                                  className={`transition-colors ${user.isActive ? 'hover:text-red-600' : 'opacity-50 cursor-not-allowed'}`}
                                  disabled={!user.isActive || deactivateMutation.isPending}
                                  title="Deactivate"
                                >
                                  <Ban size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {(!data?.content || data.content.length === 0) && (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                            No users found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination */}
              {!isLoading && !isError && data && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Showing {data.number * data.size + 1}-{Math.min((data.number + 1) * data.size, data.totalElements)} of {data.totalElements} users
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="p-1 rounded text-gray-400 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(data.totalPages - 1, p + 1))}
                      disabled={page >= data.totalPages - 1}
                      className="p-1 rounded text-gray-400 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserManagementConsole;
