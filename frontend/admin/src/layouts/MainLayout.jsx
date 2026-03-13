import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import './MainLayout.css';

// We will add auth logic later. For now, assume authenticated.
const MainLayout = () => {
    return (
        <div className="app-container">
            <Sidebar />
            <div className="main-content-wrapper">
                <Header />
                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
