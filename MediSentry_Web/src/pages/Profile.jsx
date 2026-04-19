import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { User, Mail, Phone, BookOpen, Save, LogOut, Loader2, Hospital } from 'lucide-react';

const Profile = () => {
    const { userInfo, setUserInfo, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState({
        username: '',
        email: '',
        specialization: '',
        phone_number: '',
        bio: '',
        hospital_id: ''
    });

    useEffect(() => {
        if (userInfo) {
            setProfile({
                username: userInfo.username || '',
                email: userInfo.email || '',
                specialization: userInfo.specialization || '',
                phone_number: userInfo.phone_number || '',
                bio: userInfo.bio || '',
                hospital_id: userInfo.hospital_id || ''
            });
        }
    }, [userInfo]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...profile };
            if (!payload.hospital_id || payload.hospital_id.trim() === '') {
                payload.hospital_id = null;
            }

            const res = await api.put('/users/profile/', payload);
            if (res.data) {
                setUserInfo(res.data);
                localStorage.setItem('userInfo', JSON.stringify(res.data));
                alert('Profile updated successfully!');
            }
        } catch (e) {
            console.error("Profile save error:", e);
            alert('Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Layout>
            <div className="profile-page">
                <div className="profile-header-card glass-card">
                    <div className="profile-banner"></div>
                    <div className="profile-avatar-wrapper">
                        <div className="profile-avatar">
                            {profile.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    </div>
                    <div className="profile-main-info">
                        <h1>{profile.username || 'User'}</h1>
                        <span className="role-badge">{userInfo?.role}</span>
                    </div>
                </div>

                <div className="profile-content-grid">
                    <div className="profile-form-container">
                        <form className="glass-card profile-form" onSubmit={handleSave}>
                            <h2>Account Details</h2>
                            
                            <div className="form-grid">
                                <div className="input-group">
                                    <label><User size={16} /> Full Name</label>
                                    <input 
                                        type="text" 
                                        value={profile.username}
                                        onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                                    />
                                </div>

                                <div className="input-group">
                                    <label><Mail size={16} /> Email Address</label>
                                    <input 
                                        type="email" 
                                        value={profile.email}
                                        disabled
                                        className="disabled-input"
                                    />
                                    <span className="helper">Email cannot be changed</span>
                                </div>

                                {userInfo?.role === 'DOCTOR' && (
                                    <div className="input-group">
                                        <label><BookOpen size={16} /> Specialization</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. Cardiologist"
                                            value={profile.specialization}
                                            onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                                        />
                                    </div>
                                )}

                                <div className="input-group">
                                    <label><Phone size={16} /> Phone Number</label>
                                    <input 
                                        type="tel" 
                                        placeholder="Contact Number"
                                        value={profile.phone_number}
                                        onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                                    />
                                </div>

                                <div className="input-group full">
                                    <label><BookOpen size={16} /> Bio / Department</label>
                                    <textarea 
                                        placeholder="Brief professional bio..."
                                        value={profile.bio}
                                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn-primary save-btn" disabled={saving}>
                                    {saving ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Save Changes</>}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="profile-side">
                        <div className="glass-card hospital-info-card">
                            <h3><Hospital size={20} /> Professional Context</h3>
                            <div className="hospital-details">
                                <div className="detail-item">
                                    <label>HOSPITAL ID</label>
                                    <p>{profile.hospital_id || 'Not Assigned'}</p>
                                </div>
                                <div className="detail-item">
                                    <label>JOINED DATE</label>
                                    <p>{new Date().toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>

                        <button className="logout-action-btn" onClick={() => { 
                            if(window.confirm('Are you sure?')) {
                                logout();
                                navigate('/login');
                            }
                        }}>
                            <LogOut size={20} /> Log Out Account
                        </button>
                    </div>
                </div>

                <style dangerouslySetInnerHTML={{ __html: `
                    .profile-header-card { padding: 0; overflow: hidden; margin-bottom: 30px; position: relative; text-align: center; padding-bottom: 30px; }
                    .profile-banner { height: 120px; background: var(--primary-gradient); }
                    .profile-avatar-wrapper { margin-top: -50px; display: flex; justify-content: center; margin-bottom: 15px; }
                    .profile-avatar { width: 100px; height: 100px; border-radius: 50%; background: #28005C; border: 5px solid white; color: white; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: 700; box-shadow: var(--shadow-md); }
                    .profile-main-info h1 { font-size: 1.8rem; font-weight: 700; margin-bottom: 8px; }
                    .role-badge { display: inline-block; padding: 6px 16px; background: var(--primary-light); color: var(--primary-color); border-radius: 20px; font-weight: 800; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; }

                    .profile-content-grid { display: grid; grid-template-columns: 1fr 350px; gap: 30px; }
                    .profile-form { padding: 30px; }
                    .profile-form h2 { font-size: 1.25rem; font-weight: 700; margin-bottom: 25px; color: var(--text-main); }
                    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                    .input-group.full { grid-column: 1 / -1; }
                    .input-group label { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 0.85rem; color: #555; margin-bottom: 8px; }
                    .input-group input, .input-group textarea { width: 100%; padding: 12px 16px; border-radius: 12px; border: 1.5px solid #E5E7EB; background: #F9FAFB; font-size: 0.95rem; }
                    .input-group textarea { height: 120px; resize: none; }
                    .disabled-input { background: #F3F4F6 !important; color: #999 !important; cursor: not-allowed; }
                    .helper { display: block; font-size: 0.75rem; color: #999; margin-top: 4px; }
                    
                    .form-actions { margin-top: 30px; display: flex; justify-content: flex-end; }
                    .save-btn { min-width: 180px; }

                    .hospital-info-card { padding: 25px; margin-bottom: 20px; }
                    .hospital-info-card h3 { font-size: 1rem; font-weight: 700; display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
                    .detail-item { margin-bottom: 15px; }
                    .detail-item label { display: block; font-size: 0.7rem; font-weight: 800; color: #999; margin-bottom: 4px; }
                    .detail-item p { font-weight: 700; color: var(--text-main); }

                    .logout-action-btn { width: 100%; padding: 15px; background: #FEE2E2; color: #B91C1C; border-radius: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 10px; transition: var(--transition); border: 1.2px solid #FECACA; }
                    .logout-action-btn:hover { background: #FECACA; }

                    @media (max-width: 1000px) { .profile-content-grid { grid-template-columns: 1fr; } }
                    .animate-spin { animation: spin 1s linear infinite; }
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                ` }} />
            </div>
        </Layout>
    );
};

export default Profile;
