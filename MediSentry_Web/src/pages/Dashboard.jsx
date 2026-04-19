import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';
import DoctorDashboard from './DoctorDashboard';
import PharmacistDashboard from './PharmacistDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
    const { userInfo } = useContext(AuthContext);

    const renderDashboard = () => {
        switch (userInfo?.role) {
            case 'DOCTOR':
                return <DoctorDashboard />;
            case 'PHARMACIST':
                return <PharmacistDashboard />;
            case 'ADMIN':
                return <AdminDashboard />;
            default:
                return <div>Unknown Role</div>;
        }
    };

    return (
        <Layout>
            {renderDashboard()}
        </Layout>
    );
};

export default Dashboard;
