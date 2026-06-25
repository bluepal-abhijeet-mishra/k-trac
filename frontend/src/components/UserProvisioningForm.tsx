import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, User, Shield, Save, Loader2 } from 'lucide-react';
import { usersApi, type UserCreateRequest } from '../api/users';

export const UserProvisioningForm = ({ onClose }: { onClose: () => void }) => {
  const queryClient = useQueryClient();
  // Keep form data slightly different from API request shape since we need to collect strings from inputs,
  // then map them to the proper API payload (like parsing shedId to homeLocationId, wrapping role in array)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    role: '',
    zone: '',
    shedId: ''
  });

  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: usersApi.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onClose();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || err.message || 'Failed to create user');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.username || !formData.email || !formData.role || !formData.firstName || !formData.lastName) {
      setError('Please fill in all required fields (Username, Email, First Name, Last Name, Role)');
      return;
    }

    const submissionData: UserCreateRequest = {
      username: formData.username,
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      roles: [formData.role], // backend expects an array/Set
    };

    // Convert shedId to a number if provided, to map to homeLocationId
    if (formData.shedId) {
      const parsedId = parseInt(formData.shedId.replace(/\D/g, ''), 10);
      if (!isNaN(parsedId)) {
        submissionData.homeLocationId = parsedId;
      }
    }

    mutation.mutate(submissionData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Real-time basic validation
    if (error) {
      if ((name === 'username' || name === 'email' || name === 'role') && value.trim() !== '') {
        // Simple check to clear error if user starts typing in a missing required field
        const tempForm = { ...formData, [name]: value };
        if (tempForm.username && tempForm.email && tempForm.role) {
          setError(null);
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Provision New User</h2>
            <p className="text-sm text-gray-500 mt-1">Create a new system operator profile.</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="px-6 py-6 overflow-y-auto">
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
                {error}
              </div>
            )}

            {/* Account Information Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <User className="text-secondary" size={20} />
              <h3 className="font-bold text-gray-900 text-lg">Account Information</h3>
            </div>
            <div className="h-px bg-gray-200 w-full mb-5"></div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1.5">
                  Username *
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter username"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="user@kavach.sys"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-900 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter first name"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary mb-4"
              />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
              />
            </div>
          </div>

          {/* Access Scoping Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="text-secondary" size={20} />
              <h3 className="font-bold text-gray-900 text-lg">Access Scoping</h3>
            </div>
            <div className="h-px bg-gray-200 w-full mb-5"></div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-900 mb-1.5">
                System Role *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm text-gray-700 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary appearance-none"
              >
                <option value="">Select assigned role</option>
                <option value="ADMIN">Admin</option>
                <option value="PRODUCTION_MANAGER">Production Manager</option>
                <option value="LOCO_SHED_MANAGER">Loco Shed Manager</option>
                <option value="TECHNICIAN">Technician</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1.5">
                  Operational Zone
                </label>
                <input
                  type="text"
                  name="zone"
                  value={formData.zone}
                  onChange={handleChange}
                  placeholder="e.g., North Central"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1.5">
                  Shed ID Assignment
                </label>
                <input
                  type="text"
                  name="shedId"
                  value={formData.shedId}
                  onChange={handleChange}
                  placeholder="e.g., SHD-092A"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm font-mono focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                />
              </div>
            </div>
          </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 mt-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={mutation.isPending}
              className="px-4 py-2 bg-white border border-gray-300 rounded text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 bg-primary text-white rounded text-sm font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {mutation.isPending ? 'Saving...' : 'Save User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProvisioningForm;
