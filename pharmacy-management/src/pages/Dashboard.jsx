import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
 
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  .dash { padding: 32px 36px; font-family: 'Plus Jakarta Sans', sans-serif; background: #f4f7fb; min-height: 100vh; color: #0d1b2a; }
  .dash-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; animation: fadeUp 0.4s ease both; }
  .dash-greeting { font-size: 26px; font-weight: 800; letter-spacing: -0.7px; color: #0d1b2a; }
  .dash-greeting span { color: #00b89c; }
  .dash-sub { font-size: 13px; color: #8a9ab5; margin-top: 4px; font-weight: 500; }
  .dash-sub strong { color: #f97316; font-weight: 700; }
  .dash-date-pill { background: #fff; border: 1px solid #e3eaf2; border-radius: 12px; padding: 10px 18px; font-size: 12px; color: #8a9ab5; font-weight: 600; }
  .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
  .stat-card { background: #fff; border-radius: 16px; padding: 22px; border: 1px solid #e8eef5; position: relative; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; animation: fadeUp 0.4s ease both; box-shadow: 0 1px 6px rgba(0,0,0,0.04); }
  .stat-card:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
  .stat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: 16px 16px 0 0; }
  .stat-card.c1::before { background: linear-gradient(90deg,#00e5c0,#00b89c); }
  .stat-card.c2::before { background: linear-gradient(90deg,#6366f1,#4f46e5); }
  .stat-card.c3::before { background: linear-gradient(90deg,#f59e0b,#d97706); }
  .stat-card.c4::before { background: linear-gradient(90deg,#ef4444,#dc2626); }
  .stat-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .stat-icon-box { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
  .stat-icon-box.c1{background:rgba(0,229,192,0.1);} .stat-icon-box.c2{background:rgba(99,102,241,0.1);} .stat-icon-box.c3{background:rgba(245,158,11,0.1);} .stat-icon-box.c4{background:rgba(239,68,68,0.1);}
  .stat-chip { font-size: 11px; font-weight: 700; padding: 4px 9px; border-radius: 20px; }
  .stat-chip.up { background: #d1fae5; color: #065f46; }
  .stat-chip.warn { background: #fff7ed; color: #c2410c; }
  .stat-val { font-size: 32px; font-weight: 800; color: #0d1b2a; letter-spacing: -1.2px; margin-bottom: 5px; line-height: 1; }
  .stat-lbl { font-size: 11px; color: #8a9ab5; font-weight: 600; text-transform: uppercase; letter-spacing: 0.6px; }
  .quick-actions { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; animation: fadeUp 0.4s 0.1s ease both; }
  .qbtn { background: #fff; border: 1px solid #e8eef5; border-radius: 14px; padding: 18px 12px; display: flex; flex-direction: column; align-items: center; gap: 9px; cursor: pointer; transition: all 0.2s; font-family: 'Plus Jakarta Sans', sans-serif; }
  .qbtn:hover { border-color: #00e5c0; box-shadow: 0 6px 20px rgba(0,229,192,0.12); transform: translateY(-2px); }
  .qbtn-icon { font-size: 22px; }
  .qbtn-label { font-size: 12px; font-weight: 700; color: #5a6a80; text-align: center; }
  .dash-main { display: grid; grid-template-columns: 1fr 310px; gap: 18px; margin-bottom: 18px; }
  .panel { background: #fff; border-radius: 16px; padding: 24px; border: 1px solid #e8eef5; box-shadow: 0 1px 6px rgba(0,0,0,0.04); animation: fadeUp 0.4s 0.15s ease both; }
  .panel-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 22px; }
  .panel-title { font-size: 15px; font-weight: 800; color: #0d1b2a; }
  .panel-sub { font-size: 12px; color: #8a9ab5; margin-top: 3px; }
  .bar-chart { display: flex; align-items: flex-end; gap: 12px; height: 160px; }
  .bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; height: 100%; }
  .bars { flex: 1; width: 100%; display: flex; align-items: flex-end; gap: 3px; }
  .bar { flex: 1; border-radius: 5px 5px 0 0; min-height: 4px; cursor: pointer; }
  .bar.s { background: linear-gradient(180deg,#00e5c0,#00b89c); }
  .bar.r { background: linear-gradient(180deg,#6366f1,#4f46e5); }
  .bar-lbl { font-size: 10px; color: #b0bfcc; font-weight: 700; }
  .chart-legend { display: flex; gap: 18px; margin-top: 16px; padding-top: 14px; border-top: 1px solid #f0f4f8; }
  .leg { display: flex; align-items: center; gap: 7px; font-size: 12px; color: #8a9ab5; font-weight: 600; }
  .leg-dot { width: 10px; height: 10px; border-radius: 3px; }
  .leg-dot.teal{background:#00e5c0;} .leg-dot.indigo{background:#6366f1;}
  .act-list { display: flex; flex-direction: column; }
  .act-row { display: flex; align-items: flex-start; gap: 11px; padding: 10px 0; border-bottom: 1px solid #f4f7fb; }
  .act-row:last-child { border-bottom: none; }
  .act-ico { width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; }
  .act-ico.g{background:#d1fae5;} .act-ico.b{background:#ede9fe;} .act-ico.a{background:#fef3c7;} .act-ico.r{background:#fee2e2;}
  .act-body { flex: 1; min-width: 0; }
  .act-title { font-size: 12px; font-weight: 700; color: #0d1b2a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .act-meta { font-size: 11px; color: #8a9ab5; margin-top: 2px; }
  .act-time { font-size: 10px; color: #c0cfd8; font-weight: 600; white-space: nowrap; }
  .dash-bottom { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; animation: fadeUp 0.4s 0.2s ease both; }
  .mini-tbl { width: 100%; border-collapse: collapse; }
  .mini-tbl th { font-size: 10px; font-weight: 700; color: #b0bfcc; text-transform: uppercase; letter-spacing: 0.7px; padding-bottom: 12px; text-align: left; border-bottom: 1px solid #f0f4f8; }
  .mini-tbl td { padding: 11px 0; font-size: 13px; border-bottom: 1px solid #f8fafc; vertical-align: middle; }
  .mini-tbl tr:last-child td { border-bottom: none; }
  .drug-name { font-weight: 700; color: #0d1b2a; font-size: 13px; }
  .drug-cat { font-size: 11px; color: #b0bfcc; margin-top: 1px; }
  .sbar-wrap { width: 70px; height: 5px; background: #f0f4f8; border-radius: 3px; overflow: hidden; }
  .sbar { height: 100%; border-radius: 3px; }
  .sbar.critical{background:#ef4444;} .sbar.low{background:#f59e0b;}
  .chip { display: inline-flex; padding: 3px 9px; border-radius: 20px; font-size: 10px; font-weight: 700; }
  .chip.critical{background:#fee2e2;color:#dc2626;} .chip.low{background:#fef3c7;color:#b45309;}
  .exp-list { display: flex; flex-direction: column; gap: 9px; }
  .exp-row { display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: #f8fafc; border-radius: 11px; border: 1px solid #edf2f7; }
  .exp-ico { font-size: 18px; }
  .exp-info { flex: 1; min-width: 0; }
  .exp-name { font-size: 13px; font-weight: 700; color: #0d1b2a; }
  .exp-batch { font-size: 11px; color: #b0bfcc; }
  .exp-tag { font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 20px; }
  .exp-tag.urgent{background:#fee2e2;color:#dc2626;} .exp-tag.soon{background:#fef3c7;color:#b45309;}
  .section-chip { font-size: 11px; font-weight: 800; padding: 4px 11px; border-radius: 20px; }
  .section-chip.red{background:#fee2e2;color:#dc2626;} .section-chip.amber{background:#fef3c7;color:#b45309;}
  .skeleton { background: linear-gradient(90deg,#f0f4f8 25%,#e8eef5 50%,#f0f4f8 75%); background-size: 200% 100%; animation: shimmer 1.2s infinite; border-radius: 8px; }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);} }
  @media(max-width:1100px){.stat-grid{grid-template-columns:repeat(2,1fr);}.dash-main{grid-template-columns:1fr;}.dash-bottom{grid-template-columns:1fr;}.quick-actions{grid-template-columns:repeat(2,1fr);}.dash{padding:20px 16px;}}
`;
 
const SALES_DATA = [
  { month: "Sep", s: 68, r: 45 }, { month: "Oct", s: 82, r: 58 },
  { month: "Nov", s: 74, r: 50 }, { month: "Dec", s: 95, r: 72 },
  { month: "Jan", s: 88, r: 61 }, { month: "Feb", s: 110, r: 84 },
  { month: "Mar", s: 98, r: 76 },
];
const maxVal = Math.max(...SALES_DATA.map(d => d.s));
 
function timeAgo(dateStr) {
  const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
 
export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    api.get('/dashboard/index.php')
      .then(res => setStats(res.data.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);
 
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-KE", { weekday: "short", year: "numeric", month: "short", day: "numeric" });
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
 
  const kpis = stats ? [
    { cls: "c1", icon: "💊", val: stats.total_medicines.toLocaleString(), lbl: "Drugs in Stock", chip: `${stats.low_stock} low`, chipCls: stats.low_stock > 0 ? "warn" : "up" },
    { cls: "c2", icon: "📋", val: stats.pending_rx, lbl: "Pending Prescriptions", chip: "Pending", chipCls: "warn" },
    { cls: "c3", icon: "💰", val: `KES ${stats.today_sales.toLocaleString()}`, lbl: "Today's Revenue", chip: `${stats.today_transactions} sales`, chipCls: "up" },
    { cls: "c4", icon: "⚠️", val: stats.expiring_soon + stats.expired, lbl: "Expiring / Expired", chip: "Act now", chipCls: "warn" },
  ] : [];
 
  return (
    <>
      <style>{styles}</style>
      <div className="dash">
 
        {/* Header */}
        <div className="dash-header">
          <div>
            <div className="dash-greeting">{greeting}, <span>Pharmacist 👋</span></div>
            <div className="dash-sub">
              {stats ? <>Your pharmacy snapshot — <strong>{stats.low_stock} alerts need attention</strong></> : "Loading..."}
            </div>
          </div>
          <div className="dash-date-pill">📅 {dateStr}</div>
        </div>
 
        {/* Stats */}
        <div className="stat-grid">
          {loading ? [1,2,3,4].map(i => (
            <div key={i} className="stat-card c1">
              <div className="skeleton" style={{height:42,width:42,borderRadius:12,marginBottom:16}}/>
              <div className="skeleton" style={{height:32,width:"60%",marginBottom:8}}/>
              <div className="skeleton" style={{height:12,width:"80%"}}/>
            </div>
          )) : kpis.map((s, i) => (
            <div key={i} className={`stat-card ${s.cls}`}>
              <div className="stat-top">
                <div className={`stat-icon-box ${s.cls}`}>{s.icon}</div>
                <span className={`stat-chip ${s.chipCls}`}>{s.chip}</span>
              </div>
              <div className="stat-val">{s.val}</div>
              <div className="stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>
 
        {/* Quick Actions */}
        <div className="quick-actions">
          {[
            { icon: "📋", label: "New Prescription", path: "/prescriptions" },
            { icon: "🛒", label: "New Sale", path: "/sales" },
            { icon: "📦", label: "Add Stock", path: "/inventory" },
            { icon: "👤", label: "Register Patient", path: "/patients" },
          ].map((a) => (
            <button key={a.label} className="qbtn" onClick={() => navigate(a.path)}>
              <span className="qbtn-icon">{a.icon}</span>
              <span className="qbtn-label">{a.label}</span>
            </button>
          ))}
        </div>
 
        {/* Chart + Activity */}
        <div className="dash-main">
          <div className="panel">
            <div className="panel-header">
              <div>
                <div className="panel-title">Sales & Prescriptions</div>
                <div className="panel-sub">Monthly overview</div>
              </div>
            </div>
            <div className="bar-chart">
              {SALES_DATA.map((d) => (
                <div key={d.month} className="bar-col">
                  <div className="bars">
                    <div className="bar s" style={{ height: `${(d.s / maxVal) * 130}px` }} />
                    <div className="bar r" style={{ height: `${(d.r / maxVal) * 130}px` }} />
                  </div>
                  <span className="bar-lbl">{d.month}</span>
                </div>
              ))}
            </div>
            <div className="chart-legend">
              <div className="leg"><div className="leg-dot teal" /> Sales (KES K)</div>
              <div className="leg"><div className="leg-dot indigo" /> Prescriptions</div>
            </div>
          </div>
 
          <div className="panel">
            <div className="panel-header">
              <div>
                <div className="panel-title">Recent Sales</div>
                <div className="panel-sub">Latest transactions</div>
              </div>
            </div>
            <div className="act-list">
              {loading ? [1,2,3,4].map(i=>(
                <div key={i} className="act-row">
                  <div className="skeleton" style={{width:34,height:34,borderRadius:9,flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div className="skeleton" style={{height:12,width:"80%",marginBottom:6}}/>
                    <div className="skeleton" style={{height:10,width:"60%"}}/>
                  </div>
                </div>
              )) : stats?.recent_sales?.length ? stats.recent_sales.map((s, i) => (
                <div key={i} className="act-row">
                  <div className="act-ico g">🛒</div>
                  <div className="act-body">
                    <div className="act-title">#{s.sale_number}</div>
                    <div className="act-meta">{s.customer_name} · KES {parseFloat(s.total).toLocaleString()}</div>
                  </div>
                  <div className="act-time">{timeAgo(s.created_at)}</div>
                </div>
              )) : (
                <div style={{textAlign:"center",padding:24,color:"#8a9ab5",fontSize:13}}>No sales yet today</div>
              )}
            </div>
          </div>
        </div>
 
        {/* Low Stock + Expiring */}
        <div className="dash-bottom">
          <div className="panel">
            <div className="panel-header">
              <div>
                <div className="panel-title">Low Stock Alerts</div>
                <div className="panel-sub">Below reorder level</div>
              </div>
              <span className="section-chip red">{stats?.low_stock_list?.length || 0} items</span>
            </div>
            {loading ? (
              <div className="skeleton" style={{height:120,borderRadius:10}}/>
            ) : (
              <table className="mini-tbl">
                <thead><tr><th>Drug</th><th>Units</th><th>Level</th><th>Status</th></tr></thead>
                <tbody>
                  {stats?.low_stock_list?.length ? stats.low_stock_list.map((d, i) => {
                    const status = d.stock === 0 ? "critical" : d.stock <= d.min_stock / 2 ? "critical" : "low";
                    return (
                      <tr key={i}>
                        <td><div className="drug-name">{d.name}</div><div className="drug-cat">{d.category}</div></td>
                        <td style={{ fontWeight: 700, color: status === "critical" ? "#ef4444" : "#f59e0b" }}>{d.stock}</td>
                        <td><div className="sbar-wrap"><div className={`sbar ${status}`} style={{ width: `${Math.min((d.stock / d.min_stock) * 100, 100)}%` }} /></div></td>
                        <td><span className={`chip ${status}`}>{status}</span></td>
                      </tr>
                    );
                  }) : <tr><td colSpan={4} style={{textAlign:"center",padding:24,color:"#8a9ab5"}}>All stock levels OK ✅</td></tr>}
                </tbody>
              </table>
            )}
          </div>
 
          <div className="panel">
            <div className="panel-header">
              <div>
                <div className="panel-title">Expiring Soon</div>
                <div className="panel-sub">Within next 30 days</div>
              </div>
              <span className="section-chip amber">{stats?.expiring_soon || 0} items</span>
            </div>
            {loading ? (
              <div className="skeleton" style={{height:120,borderRadius:10}}/>
            ) : stats?.expiring_soon > 0 ? (
              <div style={{fontSize:13,color:"#374151",padding:"12px 0"}}>
                <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"#fef3c7",borderRadius:10,marginBottom:8}}>
                  <span style={{fontSize:20}}>⚠️</span>
                  <div>
                    <div style={{fontWeight:700,color:"#b45309"}}>{stats.expiring_soon} medicines expiring within 30 days</div>
                    <div style={{fontSize:12,color:"#92400e",marginTop:2}}>Go to Expiry Alerts page for details</div>
                  </div>
                </div>
                {stats.expired > 0 && (
                  <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"#fee2e2",borderRadius:10}}>
                    <span style={{fontSize:20}}>🚨</span>
                    <div>
                      <div style={{fontWeight:700,color:"#dc2626"}}>{stats.expired} medicines already expired!</div>
                      <div style={{fontSize:12,color:"#b91c1c",marginTop:2}}>Remove from shelves immediately</div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{textAlign:"center",padding:32,color:"#8a9ab5"}}>
                <div style={{fontSize:36,marginBottom:8}}>✅</div>
                <div style={{fontSize:13,fontWeight:600}}>No medicines expiring soon</div>
              </div>
            )}
          </div>
        </div>
 
      </div>
    </>
  );
}
 