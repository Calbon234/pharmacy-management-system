import { useState, useEffect } from "react";
import { getSuppliers, addSupplier, updateSupplier, deleteSupplier } from "../services/supplierService";

const empty = { name: "", phone: "", email: "", address: "", status: "Active" };

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getSuppliers();
      setSuppliers(res.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = suppliers.filter(s => {
    const ms = s.name.toLowerCase().includes(search.toLowerCase()) || (s.email||"").toLowerCase().includes(search.toLowerCase());
    const mf = filter === "All" || s.status === filter;
    return ms && mf;
  });

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.phone.trim()) e.phone = "Phone is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.address.trim()) e.address = "Address is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openAdd = () => { setForm(empty); setErrors({}); setEditId(null); setModal("form"); };
  const openEdit = (s) => { setForm({ name:s.name, phone:s.phone||"", email:s.email||"", address:s.address||"", status:s.status }); setEditId(s.id); setErrors({}); setModal("form"); };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (editId) { await updateSupplier(editId, form); }
      else { await addSupplier(form); }
      await fetchData();
      setModal(null);
    } catch (e) { alert(e.response?.data?.message || "Failed to save."); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await deleteSupplier(deleteTarget.id);
      await fetchData();
      setModal(null);
    } catch { alert("Failed to delete."); }
  };

  const f = (k, v) => setForm(p => ({...p, [k]: v}));

  const S = {
    pg: { padding:"28px 32px", fontFamily:"'Plus Jakarta Sans',sans-serif", background:"#f4f7fb", minHeight:"100vh" },
    card: { background:"#fff", borderRadius:16, border:"1px solid #e8eef5", boxShadow:"0 1px 6px rgba(0,0,0,0.04)" },
    inp: (err) => ({ width:"100%", padding:"10px 13px", borderRadius:10, fontSize:13, fontFamily:"inherit", border:`1.5px solid ${err?"#fca5a5":"#e3eaf2"}`, outline:"none", color:"#0d1b2a", background:err?"#fff8f8":"#fff", boxSizing:"border-box" }),
    btn: (v) => ({ display:"inline-flex", alignItems:"center", gap:6, padding:"9px 16px", borderRadius:10, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit", border:"none", background:v==="primary"?"linear-gradient(135deg,#00e5c0,#0080ff)":v==="danger"?"#fee2e2":"#fff", color:v==="primary"?"#fff":v==="danger"?"#dc2626":"#0d1b2a", ...(v==="outline"?{border:"1.5px solid #e3eaf2"}:{}) }),
  };

  const kpis = [
    { icon:"🏭", label:"Total Suppliers", val:suppliers.length, color:"#00e5c0", filter:"All" },
    { icon:"✅", label:"Active", val:suppliers.filter(s=>s.status==="Active").length, color:"#6366f1", filter:"Active" },
    { icon:"⏸️", label:"Inactive", val:suppliers.filter(s=>s.status==="Inactive").length, color:"#f59e0b", filter:"Inactive" },
    { icon:"💊", label:"Total Medicines", val:suppliers.reduce((s,x)=>s+(parseInt(x.medicines)||0),0), color:"#f43f5e", filter:"All" },
  ];

  return (
    <div style={S.pg}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>

      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:24}}>
        <div>
          <div style={{fontSize:24,fontWeight:800,color:"#0d1b2a",letterSpacing:"-0.6px"}}>Suppliers</div>
          <div style={{fontSize:13,color:"#8a9ab5",marginTop:4,fontWeight:500}}>Manage your medicine suppliers</div>
        </div>
        <button style={S.btn("primary")} onClick={openAdd}>＋ Add Supplier</button>
      </div>

      {/* KPI Cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
        {kpis.map((k,i)=>(
          <div key={i}
            onClick={()=>setFilter(k.filter)}
            style={{
              borderRadius:16, padding:20, cursor:"pointer", transition:"all 0.2s",
              background: filter===k.filter && k.filter!=="All" ? `${k.color}15` : "#fff",
              border: filter===k.filter && k.filter!=="All" ? `1.5px solid ${k.color}` : "1px solid #e8eef5",
              boxShadow: filter===k.filter && k.filter!=="All" ? `0 8px 24px ${k.color}30` : "0 1px 6px rgba(0,0,0,0.04)",
              transform: filter===k.filter && k.filter!=="All" ? "translateY(-2px)" : "none",
            }}>
            <div style={{fontSize:22,marginBottom:10}}>{k.icon}</div>
            <div style={{fontSize:24,fontWeight:800,color:"#0d1b2a",letterSpacing:"-0.7px",lineHeight:1,marginBottom:4}}>{loading?"…":k.val}</div>
            <div style={{fontSize:11,color:"#8a9ab5",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px"}}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={S.card}>
        <div style={{display:"flex",gap:10,padding:"16px 20px",borderBottom:"1px solid #f0f4f8",flexWrap:"wrap"}}>
          <div style={{position:"relative",flex:1,minWidth:180}}>
            <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:13}}>🔍</span>
            <input style={{...S.inp(false),paddingLeft:34}} placeholder="Search suppliers..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          {["All","Active","Inactive"].map(fl=>(
            <button key={fl} onClick={()=>setFilter(fl)} style={{...S.btn(filter===fl?"primary":"outline"),padding:"9px 14px"}}>{fl}</button>
          ))}
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{background:"#f8fafc"}}>
                {["Supplier","Phone","Email","Address","Medicines","Status","Actions"].map(h=>(
                  <th key={h} style={{padding:"12px 16px",textAlign:"left",fontSize:11,fontWeight:700,color:"#8a9ab5",textTransform:"uppercase",letterSpacing:"0.6px"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? [1,2,3].map(i=>(
                <tr key={i}><td colSpan={7} style={{padding:"12px 16px"}}><div style={{height:20,background:"linear-gradient(90deg,#f0f4f8 25%,#e8eef5 50%,#f0f4f8 75%)",backgroundSize:"200% 100%",borderRadius:8}}/></td></tr>
              )) : filtered.length===0 ? (
                <tr><td colSpan={7} style={{textAlign:"center",padding:40,color:"#8a9ab5",fontSize:14}}>
                  <div style={{fontSize:36,marginBottom:8}}>🏭</div>
                  No suppliers found
                </td></tr>
              ) : filtered.map(s=>(
                <tr key={s.id} style={{borderTop:"1px solid #f0f4f8"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#fafcff"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{padding:"13px 16px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#00e5c0,#0080ff)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:14,flexShrink:0}}>{s.name.charAt(0)}</div>
                      <div style={{fontSize:13,fontWeight:700,color:"#0d1b2a"}}>{s.name}</div>
                    </div>
                  </td>
                  <td style={{padding:"13px 16px",fontSize:13,color:"#374151"}}>{s.phone||"—"}</td>
                  <td style={{padding:"13px 16px",fontSize:13,color:"#374151"}}>{s.email||"—"}</td>
                  <td style={{padding:"13px 16px",fontSize:13,color:"#374151",maxWidth:160}}>{s.address||"—"}</td>
                  <td style={{padding:"13px 16px",fontSize:13,fontWeight:700,color:"#6366f1"}}>{s.medicines||0}</td>
                  <td style={{padding:"13px 16px"}}>
                    <span style={{fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:20,background:s.status==="Active"?"#d1fae5":"#f1f5f9",color:s.status==="Active"?"#065f46":"#64748b"}}>{s.status}</span>
                  </td>
                  <td style={{padding:"13px 16px"}}>
                    <div style={{display:"flex",gap:6}}>
                      <button onClick={()=>{setViewTarget(s);setModal("view");}} style={{...S.btn("outline"),padding:"6px 10px",fontSize:12}}>👁</button>
                      <button onClick={()=>openEdit(s)} style={{...S.btn("outline"),padding:"6px 10px",fontSize:12}}>✏️</button>
                      <button onClick={()=>{setDeleteTarget(s);setModal("delete");}} style={{...S.btn("danger"),padding:"6px 10px",fontSize:12}}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{padding:"13px 20px",borderTop:"1px solid #f0f4f8",fontSize:12,color:"#8a9ab5",fontWeight:600}}>
          Showing {filtered.length} of {suppliers.length} suppliers
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modal==="form"&&(
        <div style={{position:"fixed",inset:0,background:"rgba(13,27,42,0.5)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:20}}>
          <div style={{background:"#fff",borderRadius:20,width:"100%",maxWidth:480,boxShadow:"0 24px 64px rgba(0,0,0,0.15)"}}>
            <div style={{padding:"22px 24px",borderBottom:"1px solid #f0f4f8",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{fontSize:17,fontWeight:800,color:"#0d1b2a"}}>{editId?"✏️ Edit Supplier":"➕ Add Supplier"}</div>
              <button onClick={()=>setModal(null)} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:"#8a9ab5"}}>✕</button>
            </div>
            <div style={{padding:"22px 24px",display:"flex",flexDirection:"column",gap:16}}>
              {[
                {key:"name",label:"Supplier Name",placeholder:"e.g. MedPlus Distributors"},
                {key:"phone",label:"Phone Number",placeholder:"e.g. +254 700 123 456"},
                {key:"email",label:"Email Address",placeholder:"e.g. orders@supplier.com"},
                {key:"address",label:"Address",placeholder:"e.g. Nairobi Industrial Area"},
              ].map(({key,label,placeholder})=>(
                <div key={key}>
                  <label style={{fontSize:12,fontWeight:700,color:"#374151",display:"block",marginBottom:6}}>{label}</label>
                  <input style={S.inp(errors[key])} placeholder={placeholder} value={form[key]} onChange={e=>f(key,e.target.value)}/>
                  {errors[key]&&<div style={{fontSize:11,color:"#dc2626",marginTop:4}}>{errors[key]}</div>}
                </div>
              ))}
              <div>
                <label style={{fontSize:12,fontWeight:700,color:"#374151",display:"block",marginBottom:6}}>Status</label>
                <select style={S.inp(false)} value={form.status} onChange={e=>f("status",e.target.value)}>
                  <option>Active</option><option>Inactive</option>
                </select>
              </div>
            </div>
            <div style={{padding:"16px 24px",borderTop:"1px solid #f0f4f8",display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button style={S.btn("outline")} onClick={()=>setModal(null)}>Cancel</button>
              <button style={S.btn("primary")} onClick={handleSave} disabled={saving}>{saving?"Saving...":editId?"Save Changes":"Add Supplier"}</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {modal==="view"&&viewTarget&&(
        <div style={{position:"fixed",inset:0,background:"rgba(13,27,42,0.5)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:20}}>
          <div style={{background:"#fff",borderRadius:20,width:"100%",maxWidth:420,boxShadow:"0 24px 64px rgba(0,0,0,0.15)"}}>
            <div style={{background:"linear-gradient(135deg,#0d1b2a,#1a2a40)",borderRadius:"20px 20px 0 0",padding:"28px 24px",textAlign:"center"}}>
              <div style={{width:60,height:60,borderRadius:16,background:"linear-gradient(135deg,#00e5c0,#0080ff)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,fontWeight:800,color:"#fff",margin:"0 auto 12px"}}>{viewTarget.name.charAt(0)}</div>
              <div style={{fontSize:18,fontWeight:800,color:"#fff"}}>{viewTarget.name}</div>
              <span style={{fontSize:11,fontWeight:700,padding:"4px 12px",borderRadius:20,background:viewTarget.status==="Active"?"rgba(0,229,192,0.2)":"rgba(148,163,184,0.2)",color:viewTarget.status==="Active"?"#00e5c0":"#94a3b8",marginTop:8,display:"inline-block"}}>{viewTarget.status}</span>
            </div>
            <div style={{padding:"20px 24px",display:"flex",flexDirection:"column",gap:10}}>
              {[
                {icon:"📞",label:"Phone",val:viewTarget.phone||"—"},
                {icon:"📧",label:"Email",val:viewTarget.email||"—"},
                {icon:"📍",label:"Address",val:viewTarget.address||"—"},
              ].map((r,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:"#f8fafc",borderRadius:10}}>
                  <span style={{fontSize:18}}>{r.icon}</span>
                  <div>
                    <div style={{fontSize:10,color:"#8a9ab5",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px"}}>{r.label}</div>
                    <div style={{fontSize:13,fontWeight:700,color:"#0d1b2a",marginTop:1}}>{r.val}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{padding:"0 24px 22px",display:"flex",gap:10}}>
              <button style={{...S.btn("outline"),flex:1}} onClick={()=>setModal(null)}>Close</button>
              <button style={{...S.btn("primary"),flex:1}} onClick={()=>{setModal(null);openEdit(viewTarget);}}>Edit Supplier</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modal==="delete"&&deleteTarget&&(
        <div style={{position:"fixed",inset:0,background:"rgba(13,27,42,0.5)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:20}}>
          <div style={{background:"#fff",borderRadius:20,width:"100%",maxWidth:380,padding:28,boxShadow:"0 24px 64px rgba(0,0,0,0.15)",textAlign:"center"}}>
            <div style={{fontSize:44,marginBottom:14}}>🗑️</div>
            <div style={{fontSize:18,fontWeight:800,color:"#0d1b2a",marginBottom:8}}>Delete Supplier?</div>
            <div style={{fontSize:13,color:"#8a9ab5",marginBottom:22}}>Are you sure you want to delete <strong style={{color:"#0d1b2a"}}>{deleteTarget.name}</strong>?</div>
            <div style={{display:"flex",gap:10}}>
              <button style={{...S.btn("outline"),flex:1}} onClick={()=>setModal(null)}>Cancel</button>
              <button style={{flex:1,padding:"10px 16px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#f43f5e,#e11d48)",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}} onClick={handleDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}