import { FiBox, FiTruck, FiActivity, FiSettings, FiArrowUpRight, FiClock, FiAlertCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';

const ProductionDashboard = () => {
    const stats = [
        { label: 'Units Produced', value: '12,480', icon: <FiBox />, color: 'var(--info)', growth: '+8%' },
        { label: 'Stock Transfers', value: '450', icon: <FiTruck />, color: 'var(--success)', growth: '+12%' },
        { label: 'Factory Efficiency', value: '94.2%', icon: <FiActivity />, color: 'var(--warning)', growth: '-2%' },
    ]

    return (
        <div className="dashboard-container" style={{ padding: '0' }}>
            <header className="page-header" style={{ marginBottom: '40px' }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: '32px', fontWeight: 800 }}>Production & Logistics</h1>
                    <p style={{ color: 'var(--text-secondary)', fontWeight: 600, marginTop: '4px' }}>Chief Production Officer Dashboard</p>
                </div>
                <div className="badge badge-success" style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--text-main)', color: 'white' }}>
                    <FiActivity style={{ color: '#10b981' }} />
                    Factory Live
                </div>
            </header>

            <div className="stats-grid">
                {stats.map((stat, i) => (
                    <div key={i} className="stat-card">
                        <div className="stat-icon" style={{ background: '#f8fafc', color: stat.color, width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                            {stat.icon}
                        </div>
                        <div className="stat-value">{stat.value}</div>
                        <div className="stat-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <span>{stat.label}</span>
                            <span style={{ fontSize: '11px', color: stat.growth.startsWith('+') ? 'var(--success)' : stat.growth.startsWith('-') ? 'var(--danger)' : 'var(--text-secondary)' }}>{stat.growth}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
                gap: '24px'
            }}>
                <div className="card" style={{ padding: '0' }}>
                    <div className="card-header" style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Factory Output Status</h2>
                    </div>
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                            <FiActivity size={48} style={{ opacity: 0.2 }} />
                        </div>
                        <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Real-time production feed will appear here</p>
                    </div>
                </div>

                <div className="card" style={{ background: 'var(--text-main)', color: 'white', border: 'none' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FiAlertCircle color="#fbbf24" /> Critical Alerts
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', borderLeft: '4px solid var(--danger)' }}>
                            <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '4px' }}>Line 4 Interruption</div>
                            <div style={{ fontSize: '12px', opacity: 0.7 }}>Maintenance required immediately to prevent backlog.</div>
                        </div>
                        <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', borderLeft: '4px solid var(--warning)' }}>
                            <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '4px' }}>Logistics Delay</div>
                            <div style={{ fontSize: '12px', opacity: 0.7 }}>Stock transfer to TRZ branch delayed by 45 mins.</div>
                        </div>
                    </div>

                    <button className="btn" style={{ width: '100%', marginTop: '32px', background: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 700 }}>
                        View All System Logs
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductionDashboard;
