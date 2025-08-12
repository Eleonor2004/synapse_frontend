'use client';

import { useState, useMemo } from 'react';
import { motion, Variants } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, Filter, Plus, Eye, Edit3, MoreVertical, Trash2, User as UserIcon, Loader2, AlertCircle, Shield, Check, X
} from 'lucide-react';
import { useNotifications } from '../../components/ui/Notification';
import { User } from '@/types/api';
import { getAllUsers, createUser, updateUser, deleteUser, UserCreationData, UserUpdateData } from '../../services/adminService';

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
};

// --- A simple Modal component for Create/Edit forms ---
const UserModal = ({ user, onClose, onSave, isLoading }: { user?: User | null, onClose: () => void, onSave: (data: UserCreationData | UserUpdateData) => void, isLoading: boolean }) => {
    const [formData, setFormData] = useState({
        username: user?.username || '',
        full_name: user?.full_name || '',
        password: '',
        role: user?.role || 'analyst',
        is_active: user?.is_active ?? true,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b">
                        <h3 className="text-xl font-bold">{user ? 'Edit User' : 'Create New User'}</h3>
                        <p className="text-sm text-gray-500">{user ? `Editing profile for ${user.full_name}` : 'Fill in the details to add a new team member.'}</p>
                    </div>
                    <div className="p-6 space-y-4">
                        <input name="full_name" value={formData.full_name} onChange={handleInputChange} placeholder="Full Name" className="w-full p-3 border rounded-lg" required />
                        <input name="username" value={formData.username} onChange={handleInputChange} placeholder="Username" className="w-full p-3 border rounded-lg" required disabled={!!user} />
                        {!user && <input name="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="Password" className="w-full p-3 border rounded-lg" required />}
                        <select name="role" value={formData.role} onChange={handleInputChange} className="w-full p-3 border rounded-lg">
                            <option value="analyst">Analyst</option>
                            <option value="admin">Admin</option>
                        </select>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleInputChange} className="h-4 w-4" />
                            User is Active
                        </label>
                    </div>
                    <div className="p-6 border-t bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-4 rounded-b-2xl">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin" /> : (user ? 'Save Changes' : 'Create User')}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

// --- Main User Management Tab Component ---
export default function UserManagementTab() {
    const { addNotification } = useNotifications();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [modalState, setModalState] = useState<{ mode: 'create' | 'edit' | null, user?: User | null }>({ mode: null });

    // --- DATA FETCHING ---
    const { data: users = [], isLoading, isError } = useQuery<User[]>({
      queryKey: ['allUsers'],
      queryFn: getAllUsers,
    });

    // --- DATA MUTATIONS ---
    const createUserMutation = useMutation({
        mutationFn: createUser,
        onSuccess: () => {
            addNotification('success', 'User Created', 'The new user has been added successfully.');
            queryClient.invalidateQueries({ queryKey: ['allUsers'] });
            setModalState({ mode: null });
        },
        onError: (error: any) => addNotification('error', 'Creation Failed', error.response?.data?.detail || 'Could not create user.'),
    });

    const updateUserMutation = useMutation({
        mutationFn: updateUser,
        onSuccess: () => {
            addNotification('success', 'User Updated', 'The user details have been saved.');
            queryClient.invalidateQueries({ queryKey: ['allUsers'] });
            setModalState({ mode: null });
        },
        onError: (error: any) => addNotification('error', 'Update Failed', error.response?.data?.detail || 'Could not update user.'),
    });

    const deleteUserMutation = useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            addNotification('success', 'User Deleted', 'The user has been removed.');
            queryClient.invalidateQueries({ queryKey: ['allUsers'] });
        },
        onError: (error: any) => addNotification('error', 'Delete Failed', error.response?.data?.detail || 'Could not delete user.'),
    });

    const handleSaveUser = (data: UserCreationData | UserUpdateData) => {
        if (modalState.mode === 'create') {
            createUserMutation.mutate(data as UserCreationData);
        } else if (modalState.mode === 'edit' && modalState.user) {
            updateUserMutation.mutate({ username: modalState.user.username, data });
        }
    };

    const handleDeleteUser = (username: string) => {
        if (window.confirm(`Are you sure you want to delete the user "${username}"? This action cannot be undone.`)) {
            deleteUserMutation.mutate(username);
        }
    };

    const filteredUsers = useMemo(() => {
        if (!searchTerm.trim()) return users;
        const lowerSearch = searchTerm.toLowerCase();
        return users.filter(user => 
            user.full_name?.toLowerCase().includes(lowerSearch) ||
            user.username.toLowerCase().includes(lowerSearch)
        );
    }, [users, searchTerm]);
  
    const getStatusPill = (isActive: boolean) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
            isActive 
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
        }`}>
            <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
            {isActive ? 'Active' : 'Inactive'}
        </span>
    );
  
    const getRolePill = (role: string) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
            role === 'admin' 
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
        }`}>
            <Shield className="w-3 h-3" />
            {role.charAt(0).toUpperCase() + role.slice(1)}
        </span>
    );
  
    return (
      <>
        <AnimatePresence>
            {modalState.mode && (
                <UserModal 
                    user={modalState.user} 
                    onClose={() => setModalState({ mode: null })} 
                    onSave={handleSaveUser}
                    isLoading={createUserMutation.isPending || updateUserMutation.isPending}
                />
            )}
        </AnimatePresence>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">User Management</h2>
                    <p className="text-gray-600 dark:text-gray-400">Manage team members and their permissions</p>
                </div>
                <motion.button onClick={() => setModalState({ mode: 'create' })} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg" whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                    <Plus className="w-5 h-5" /> Add User
                </motion.button>
            </motion.div>
    
            <motion.div variants={cardVariants} initial="hidden" animate="visible" className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border">
                <div className="relative flex-grow">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" placeholder="Search by name or username..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border rounded-xl" />
                </div>
            </motion.div>
    
            <motion.div variants={cardVariants} initial="hidden" animate="visible" className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900 border-b">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold">User</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Role</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {isLoading && <tr><td colSpan={4} className="text-center p-8"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></td></tr>}
                            {isError && <tr><td colSpan={4} className="text-center p-8 text-red-500"><AlertCircle className="w-8 h-8 mx-auto mb-2" /> Could not load users.</td></tr>}
                            {filteredUsers.map((user, index) => (
                                <motion.tr key={user.username} initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: index * 0.05 } }} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-semibold">
                                                {user.full_name?.charAt(0) || user.username.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium">{user.full_name || 'N/A'}</p>
                                                <p className="text-sm text-gray-500">{user.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{getRolePill(user.role)}</td>
                                    <td className="px-6 py-4">{getStatusPill(user.is_active)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => setModalState({ mode: 'edit', user })} className="p-2 text-gray-400 hover:text-blue-600" title="Edit User"><Edit3 className="w-4 h-4" /></button>
                                            <button onClick={() => handleDeleteUser(user.username)} className="p-2 text-gray-400 hover:text-red-600" title="Delete User"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
      </>
    );
};