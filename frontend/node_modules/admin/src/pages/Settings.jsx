import { useState, useEffect } from 'react';
import { FiUser, FiBell, FiShield, FiSave, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Settings.css';

const Settings = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('profile');
    const [isLoading, setIsLoading] = useState(false);

    const [profileData, setProfileData] = useState({
        name: user?.name || 'Administrator',
        email: user?.email || 'admin@guardiantutoring.com',
        phone: '+1 (555) 123-4567',
        role: user?.role || 'Admin'
    });

    const [notificationPrefs, setNotificationPrefs] = useState({
        emailAlerts: true,
        smsAlerts: false,
        newEnquiries: true,
        paymentReminders: true
    });

    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleCheckboxChange = (e) => {
        setNotificationPrefs({ ...notificationPrefs, [e.target.name]: e.target.checked });
    };

    const handleSave = (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            alert('Settings saved successfully!');
        }, 800);
    };

    return (
        <div className="settings-page animate-fade-in">
            <div className="settings-header">
                <h1 className="h1">Settings</h1>
                <p className="text-muted">Manage your account preferences and configurations.</p>
            </div>

            <div className="settings-container">
                <div className="settings-sidebar glass-panel">
                    <nav className="settings-nav">
                        <button
                            className={`settings-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            <FiUser className="nav-icon" />
                            <span>Profile</span>
                        </button>
                        <button
                            className={`settings-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
                            onClick={() => setActiveTab('notifications')}
                        >
                            <FiBell className="nav-icon" />
                            <span>Notifications</span>
                        </button>
                        <button
                            className={`settings-nav-item ${activeTab === 'security' ? 'active' : ''}`}
                            onClick={() => setActiveTab('security')}
                        >
                            <FiShield className="nav-icon" />
                            <span>Security</span>
                        </button>
                    </nav>
                </div>

                <div className="settings-content glass-panel">
                    {activeTab === 'profile' && (
                        <div className="settings-section animate-fade-in">
                            <h2 className="settings-section-title">Personal Information</h2>
                            <form onSubmit={handleSave} className="settings-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            className="form-input"
                                            value={profileData.name}
                                            onChange={handleProfileChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            className="form-input"
                                            value={profileData.email}
                                            onChange={handleProfileChange}
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            className="form-input"
                                            value={profileData.phone}
                                            onChange={handleProfileChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Role</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={profileData.role}
                                            disabled
                                        />
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                                        {isLoading ? 'Saving...' : <><FiSave /> Save Changes</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="settings-section animate-fade-in">
                            <h2 className="settings-section-title">Notification Preferences</h2>
                            <form onSubmit={handleSave} className="settings-form">
                                <div className="toggle-group">
                                    <div className="toggle-item">
                                        <div className="toggle-info">
                                            <h4>Email Alerts</h4>
                                            <p className="text-muted">Receive daily summaries via email.</p>
                                        </div>
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                name="emailAlerts"
                                                checked={notificationPrefs.emailAlerts}
                                                onChange={handleCheckboxChange}
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                    <div className="toggle-item">
                                        <div className="toggle-info">
                                            <h4>SMS Alerts</h4>
                                            <p className="text-muted">Get urgent notifications via SMS.</p>
                                        </div>
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                name="smsAlerts"
                                                checked={notificationPrefs.smsAlerts}
                                                onChange={handleCheckboxChange}
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                    <div className="toggle-item">
                                        <div className="toggle-info">
                                            <h4>New Enquiries</h4>
                                            <p className="text-muted">Notify when a new enquiry is submitted.</p>
                                        </div>
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                name="newEnquiries"
                                                checked={notificationPrefs.newEnquiries}
                                                onChange={handleCheckboxChange}
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                    <div className="toggle-item">
                                        <div className="toggle-info">
                                            <h4>Payment Reminders</h4>
                                            <p className="text-muted">Alerts for pending or overdue payments.</p>
                                        </div>
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                name="paymentReminders"
                                                checked={notificationPrefs.paymentReminders}
                                                onChange={handleCheckboxChange}
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                </div>
                                <div className="form-actions" style={{ marginTop: '2rem' }}>
                                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                                        {isLoading ? 'Saving...' : <><FiSave /> Save Preferences</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="settings-section animate-fade-in">
                            <h2 className="settings-section-title">Update Password</h2>
                            <form onSubmit={handleSave} className="settings-form" style={{ maxWidth: '500px' }}>
                                <div className="form-group">
                                    <label className="form-label">Current Password</label>
                                    <input type="password" className="form-input" placeholder="••••••••" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">New Password</label>
                                    <input type="password" className="form-input" placeholder="••••••••" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Confirm New Password</label>
                                    <input type="password" className="form-input" placeholder="••••••••" />
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                                        {isLoading ? 'Updating...' : <><FiShield /> Update Password</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
