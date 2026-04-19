import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { 
  History as HistoryIcon, 
  Search, 
  Filter, 
  Loader2, 
  ChevronRight,
  FileText,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await api.get('/prescriptions/');
            const sorted = res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setHistory(sorted);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const filteredHistory = history.filter(item => 
        (item.patient_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toString().includes(searchTerm)
    );

    const getRiskStyles = (level) => {
        switch(level) {
            case 'HIGH': return { bg: '#FEE2E2', color: '#EF4444' };
            case 'MEDIUM': return { bg: '#FEF3C7', color: '#F59E0B' };
            default: return { bg: '#D1FAE5', color: '#10B981' };
        }
    };

    return (
        <Layout>
            <div className="history-page">
                <div className="page-header">
                    <div className="header-icon">
                        <img src="/assets/Logo.png" alt="Logo" style={{ width: '40px', height: '40px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                    </div>
                    <div>
                        <h1>Prescription History</h1>
                        <p>Access and review historical medical clinical records</p>
                    </div>
                </div>

                <div className="history-filters glass-card">
                    <div className="search-box">
                        <Search size={20} color="#999" />
                        <input 
                            type="text" 
                            placeholder="Search by patient name or Rx ID..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="filter-btn">
                        <Filter size={20} />
                        <span>Filters</span>
                    </button>
                </div>

                <div className="history-content">
                    {loading ? (
                        <div className="loading-state">
                            <Loader2 className="animate-spin" size={48} />
                            <p>Retrieving history...</p>
                        </div>
                    ) : filteredHistory.length === 0 ? (
                        <div className="empty-state">
                            <FileText size={64} color="#ccc" />
                            <h3>No Records Found</h3>
                            <p>We couldn't find any prescriptions matching your criteria.</p>
                        </div>
                    ) : (
                        <div className="history-list">
                            {filteredHistory.map((item) => {
                                const styles = getRiskStyles(item.risk_level);
                                return (
                                    <div 
                                        key={item.id} 
                                        className="history-card glass-card"
                                        onClick={() => navigate(`/prescription-detail/${item.id}`, { state: { prescription: item } })}
                                    >
                                        <div className="card-top">
                                            <div className="patient-meta">
                                                <h3>{item.patient_name || `Patient #${item.patient}`}</h3>
                                                <div className="rx-id">Rx #{item.id}</div>
                                            </div>
                                            <div className="risk-badge" style={{ backgroundColor: styles.bg, color: styles.color }}>
                                                {item.risk_level} RISK
                                            </div>
                                        </div>

                                        <div className="card-info">
                                            <div className="info-item">
                                                <Calendar size={16} />
                                                <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <div className="info-item">
                                                <span className={`status-tag ${item.status.toLowerCase()}`}>{item.status}</span>
                                            </div>
                                        </div>

                                        <div className="card-drugs">
                                            {item.drugs?.slice(0, 3).map((d, i) => (
                                                <span key={i} className="drug-pill">
                                                    {d.drug_details?.name || d.drug_name}
                                                </span>
                                            ))}
                                            {item.drugs?.length > 3 && (
                                                <span className="drug-more">+{item.drugs.length - 3} more</span>
                                            )}
                                        </div>

                                        <div className="card-footer">
                                            <span>View Details</span>
                                            <ChevronRight size={18} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <style dangerouslySetInnerHTML={{ __html: `
                    .page-header { display: flex; align-items: center; gap: 20px; margin-bottom: 30px; }
                    .header-icon { width: 64px; height: 64px; background: var(--primary-gradient); border-radius: 16px; display: flex; align-items: center; justify-content: center; }
                    .page-header h1 { font-size: 2rem; font-weight: 700; }

                    .history-filters { display: flex; gap: 20px; padding: 20px 30px; margin-bottom: 30px; }
                    .search-box { flex: 1; display: flex; align-items: center; gap: 15px; background: #F3F4F6; padding: 0 20px; border-radius: 12px; }
                    .search-box input { background: none; border: none; height: 50px; width: 100%; font-size: 1rem; }
                    .filter-btn { display: flex; align-items: center; gap: 10px; background: white; border: 1.5px solid #E5E7EB; padding: 0 25px; border-radius: 12px; font-weight: 700; color: #555; }

                    .history-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 25px; }
                    .history-card { padding: 25px; cursor: pointer; transition: var(--transition); display: flex; flex-direction: column; }
                    .history-card:hover { transform: translateY(-5px); border-color: var(--primary-color); box-shadow: var(--shadow-lg); }
                    
                    .card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; }
                    .patient-meta h3 { font-size: 1.2rem; font-weight: 700; color: var(--primary-color); margin-bottom: 2px; }
                    .rx-id { font-size: 0.8rem; font-weight: 700; color: #999; }
                    .risk-badge { font-size: 0.7rem; font-weight: 800; padding: 6px 12px; border-radius: 20px; text-transform: uppercase; }

                    .card-info { display: flex; gap: 20px; margin-bottom: 20px; }
                    .info-item { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; color: #666; font-weight: 600; }
                    
                    .status-tag { padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; }
                    .status-tag.approved { background: #D1FAE5; color: #10B981; }
                    .status-tag.pending { background: #F3F4F6; color: #4B5563; }
                    .status-tag.flagged { background: #FEE2E2; color: #EF4444; }

                    .card-drugs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 25px; flex: 1; }
                    .drug-pill { background: #F3F4F6; color: #4B5563; padding: 5px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
                    .drug-more { font-size: 0.8rem; color: #999; font-weight: 700; padding: 5px; }

                    .card-footer { display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #f0f0f0; padding-top: 15px; color: var(--primary-color); font-weight: 700; font-size: 0.9rem; }

                    .loading-state, .empty-state { grid-column: 1 / -1; min-height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; color: #999; }
                    .empty-state h3 { color: #333; }
                    .animate-spin { animation: spin 1s linear infinite; }
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                ` }} />
            </div>
        </Layout>
    );
};

export default History;
