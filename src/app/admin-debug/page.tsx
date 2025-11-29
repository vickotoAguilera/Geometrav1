'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/firebase/provider';
import { db } from '@/firebase/config';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminDebugPage() {
    const { user } = useUser();
    const [status, setStatus] = useState<any>(null);
    const [usersList, setUsersList] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

    const checkStatus = async () => {
        if (!user) return;
        setLoading(true);
        try {
            addLog(`Checking status for ${user.email} (${user.uid})...`);

            // 1. Check Profile
            const profileRef = doc(db, 'users', user.uid, 'profile', 'data');
            const profileSnap = await getDoc(profileRef);

            // 2. Check Admin Collection
            const adminRef = doc(db, 'admins', user.uid);
            const adminSnap = await getDoc(adminRef);

            setStatus({
                profile: profileSnap.exists() ? profileSnap.data() : 'Not Found',
                adminCollection: adminSnap.exists() ? adminSnap.data() : 'Not Found',
            });
            addLog('Status check complete.');
        } catch (error) {
            addLog(`Error checking status: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    const forceMakeAdmin = async () => {
        if (!user) return;
        if (!confirm('¿Seguro que quieres forzar permisos de admin?')) return;

        try {
            addLog('Forcing admin permissions...');

            // 1. Update Profile
            const profileRef = doc(db, 'users', user.uid, 'profile', 'data');
            await updateDoc(profileRef, {
                role: 'admin',
                updatedAt: serverTimestamp()
            });
            addLog('✅ Profile role updated to admin');

            // 2. Add to Admins Collection
            const adminRef = doc(db, 'admins', user.uid);
            await setDoc(adminRef, {
                email: user.email,
                role: 'admin',
                createdAt: serverTimestamp()
            });
            addLog('✅ Added to admins collection');

            alert('¡Permisos de admin aplicados! Recarga la página.');
            checkStatus();
        } catch (error) {
            addLog(`❌ Error making admin: ${error}`);
            alert(`Error: ${error}`);
        }
    };

    const listAllUsers = async () => {
        try {
            addLog('Listing all users via collectionGroup...');
            // Usar collectionGroup para encontrar documentos 'profile'
            // Nota: Esto requiere una regla de índice en Firestore si se usa con filtros complejos,
            // pero para listar todo debería funcionar si las reglas lo permiten.
            const { collectionGroup } = await import('firebase/firestore');
            const profilesSnap = await getDocs(collectionGroup(db, 'profile'));

            addLog(`Found ${profilesSnap.size} profile documents.`);

            const usersData = [];
            for (const docSnap of profilesSnap.docs) {
                // El path es users/{userId}/profile/data
                // docSnap.ref.parent.parent.id debería ser userId
                const userId = docSnap.ref.parent.parent?.id;
                if (userId && docSnap.id === 'data') {
                    usersData.push({
                        id: userId,
                        profile: docSnap.data()
                    });
                }
            }
            setUsersList(usersData);
            addLog(`Loaded details for ${usersData.length} users.`);
        } catch (error) {
            addLog(`❌ Error listing users: ${error}`);
            addLog('NOTE: This usually fails if you are not an admin yet.');
        }
    };

    useEffect(() => {
        if (user) checkStatus();
    }, [user]);

    if (!user) return <div className="p-8">Please log in first.</div>;

    return (
        <div className="container mx-auto p-8 space-y-8">
            <h1 className="text-3xl font-bold">🛠️ Admin Debug Tool</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Status Panel */}
                <Card>
                    <CardHeader>
                        <CardTitle>Current User Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p><strong>User ID:</strong> {user.uid}</p>
                            <p><strong>Email:</strong> {user.email}</p>
                        </div>
                        <div className="space-y-2">
                            <Button onClick={checkStatus} disabled={loading} variant="outline" className="w-full">
                                🔄 Refresh Status
                            </Button>
                            <Button onClick={forceMakeAdmin} className="w-full bg-red-600 hover:bg-red-700">
                                👑 Force Make Me Admin
                            </Button>
                        </div>
                        <div className="bg-slate-100 p-4 rounded overflow-auto max-h-60 text-xs font-mono">
                            <pre>{JSON.stringify(status, null, 2)}</pre>
                        </div>
                    </CardContent>
                </Card>

                {/* Logs Panel */}
                <Card>
                    <CardHeader>
                        <CardTitle>Logs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-black text-green-400 p-4 rounded h-96 overflow-auto font-mono text-xs">
                            {logs.map((log, i) => (
                                <div key={i} className="mb-1 border-b border-green-900/30 pb-1">{log}</div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Users List */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span>Database Users</span>
                        <Button onClick={listAllUsers}>📂 List All Users</Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="p-2">User ID</th>
                                    <th className="p-2">Email</th>
                                    <th className="p-2">Role</th>
                                    <th className="p-2">Teacher Request</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usersList.map((u) => (
                                    <tr key={u.id} className="border-b">
                                        <td className="p-2 font-mono text-xs">{u.id}</td>
                                        <td className="p-2">{u.profile?.email || 'N/A'}</td>
                                        <td className="p-2">
                                            <span className={`px-2 py-1 rounded text-xs ${u.profile?.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100'}`}>
                                                {u.profile?.role || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="p-2">
                                            {u.profile?.teacherRequest ? (
                                                <span className={`px-2 py-1 rounded text-xs ${u.profile.teacherRequest.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    u.profile.teacherRequest.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100'
                                                    }`}>
                                                    {u.profile.teacherRequest.status}
                                                </span>
                                            ) : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {usersList.length === 0 && <p className="text-center py-4 text-gray-500">Click "List All Users" to fetch data.</p>}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
