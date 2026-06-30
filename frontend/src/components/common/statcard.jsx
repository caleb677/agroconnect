import React from 'react';
import { C } from '../../utils/constants.js';

const StatCard = ({ title, value, icon, color }) => {
  return (
    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderLeft: `4px solid ${color || C.primary}` }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>{title}</h3>
      <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: color || C.primary }}>{value}</p>
      {icon && <span style={{ fontSize: '24px' }}>{icon}</span>}
    </div>
  );
};

export default StatCard;