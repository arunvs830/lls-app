import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import '../styles/StatCard.css';

const StatCard = ({ title, value, icon, trend }) => {
    return (
        <div className="stat-card">
            <div className="stat-icon">{icon}</div>
            <div className="stat-info">
                <h3>{title}</h3>
                <p className="stat-value">{value}</p>
                {trend && (
                    <span className={`stat-trend ${trend > 0 ? 'positive' : 'negative'}`}>
                        {trend > 0 ? (
                            <TrendingUp size={14} style={{ marginRight: '4px' }} />
                        ) : (
                            <TrendingDown size={14} style={{ marginRight: '4px' }} />
                        )}
                        {Math.abs(trend)}%
                    </span>
                )}
            </div>
        </div>
    );
};

export default StatCard;
