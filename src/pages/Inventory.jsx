import { useState, useEffect } from "react";
import { getMedicines, addMedicine, updateMedicine, deleteMedicine } from "../services/inventoryService";
import { getSuppliers } from "../services/supplierService";

const empty = { name: "", batch_number: "", category: "", supplier_id: "", price: "", stock: "", min_stock: "20", expiry_date: "", description: "" };
const CATEGORIES = ["Antibiotics","Analgesics","Antidiabetics","Antihypertensives","Gastrointestinal","Vitamins","Respiratory","Other"];

export default function Inventory() {
  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [medRes, supRes] = await Promise.all([getMedicines(), getSuppliers()]);
      setMedicines(medRes.data.data || []);
      setSuppliers(supRes.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = medicines.filter(m => {
    const ms = m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.category||"").toLowerCase().includes(search.toLowerCase()) ||
      (m.batch_number||"").toLowerCase().includes(search.toLowerCase());
    const mc = !catFilter || m.category === catFilter;
    const mst = stockFilter === "all" ? true
      : stockFilter === "low" ? m.stock <= m.min_stock && m.stock > 0
      : stockFilter === "out" ? m.stock === 0
      : stockFilter === "instock" ? m.stock > m.min_stock
      : true;
    return ms && mc && mst;
  });

  const paginated = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.price || isNaN(form.price)) e.price = "Valid price required";
    if (!form.stock || isNaN(form.stock)) e.stock = "Valid stock required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openAdd = () => { setForm(empty); setErrors({}); setEditId(null); setModal("form"); };
  const openEdit = (m) => {
    setForm({
      name: m.name,
      batch_number: m.batch_number||"",
      category: m.category||"",
      supplier_id: m.supplier_id||"",
      price: m.price,
      stock: m.stock,
      min_stock: m.min_stock||20,
      expiry_date: m.expiry_date||"",
      description: m.description||""
    });
    setEditId(m.id); setErrors({}); setModal("form");
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (editId) { await updateMedicine(editId, form); }
      else { await addMedicine(form); }
      await fetchData();
      setModal(null);
    } catch (e) { alert(e.response?.data?.message || "Failed to save."); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await deleteMedicine(deleteTarget.id);
      await fetchData();
      setModal(null);
    } catch { alert("Failed to delete."); }
  };

  const f = (k, v) => setForm(p => ({...p, [k]: v}));

  const stockStatus = (m) => {
    if (m.stock === 0) return { label: "Out of Stock", bg: "#fee2e2", color: "#dc2626" };
    if (m.stock <= m.min_stock) return { label: "Low Stock", bg: "#fef3c7", color: "#b45309" };
    return { label: "In Stock", bg: "#d1fae5", color: "#065f46" };
  };

  const S = {
    pg: { padding: "28px 32px", fontFamily: "'Plus Jakarta Sans',sans-serif", background: "#f4f7fb", minHeight: "100vh" },
    card: { background: "#fff", borderRadius: 16, border: "1px solid #e8eef5", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" },
    inp: (err) => ({ width: "100%", padding: "10px 13px", borderRadius: 10, fontSize: 13, fontFamily: "inherit", border: `1.5px solid ${err?"#fca5a5":"#e3eaf2"}`, outline: "none", color: "#0d1b2a", background: err?"#fff8f8":"#fff", boxSizing: "border-box" }),
    btn: (v) => ({ display:"inline-flex", alignItems:"center", gap:6, padding:"9px 16px", borderRadius:10, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit", border:"none", background: v==="primary"?"linear-gradient(135deg,#00e5c0,#0080ff)": v==="danger"?"#fee2e2":"#fff", color: v==="primary"?"#fff": v==="danger"?"#dc2626":"#0d1b2a", ...(v==="outline"?{border:"1.5px solid #e3eaf2"}:{}) }),
  };

  const kpis = [
    {icon:"💊",label:"Total Medicines",val:medicines.length,color:"#00e5c0",filter:"all"},
    {icon:"✅",label:"In Stock",val:medicines.filter(m=>m.stock>m.min_stock).length,color:"#6366f1",filter:"instock"},
    {icon:"⚠️",label:"Low Stock",val:medicines.filter(m=>m.stock<=m.min_stock&&m.stock>0).length,color:"#f59e0b",filter:"low"},
    {icon:"🚫",label:"Out of Stock",val:medicines.filter(m=>m.stock===0).length,color:"#f43f5e",filter:"out"},
  ];

  return (
    <div style={S.pg}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:24}}>
        <div>
          <div style={{fontSize:24,fontWeight:800,color:"#0d1b2a",letterSpacing:"-0.6px"}}>Inventory</div>
          <div style={{fontSize:13,color:"#8a9ab5",marginTop:4,fontWeight:500}}>{medicines.length} medicines total · {medicines.filter(m=>m.stock<=m.min_stock).length} low stock</div>
        </div>
        <button style={S.btn("primary")} onClick={openAdd}>＋ Add Medicine</button>
      </div>

      {/* KPI Cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
        {kpis.map((k,i)=>(
          <div key={i}
            onClick={()=>{setStockFilter(k.filter);setPage(1);}}
            style={{
              borderRadius:16, padding:20, position:"relative", overflow:"hidden",
              cursor:"pointer", transition:"all 0.2s",
              background: stockFilter===k.filter ? `${k.color}15` : "#fff",
              border: stockFilter===k.filter ? `1.5px solid ${k.color}` : "1px solid #e8eef5",
              transform: stockFilter===k.filter ? "translateY(-2px)" : "none",
              boxShadow: stockFilter===k.filter ? `0 8px 24px ${k.color}30` : "0 1px 6px rgba(0,0,0,0.04)",
            }}>
            {loading ? <div style={{height:60,background:"linear-gradient(90deg,#f0f4f8 25%,#e8eef5 50%,#f0f4f8 75%)",backgroundSize:"200% 100%",animation:"shimmer 1.2s infinite",borderRadius:8}}/> : <>
              <div style={{width:38,height:38,borderRadius:10,background:`${k.color}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,marginBottom:12}}>{k.icon}</div>
              <div style={{fontSize:24,fontWeight:800,color:"#0d1b2a",letterSpacing:"-0.7px",lineHeight:1,marginBottom:4}}>{k.val}</div>
              <div style={{fontSize:11,color:"#8a9ab5",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px"}}>{k.label}</div>
            </>}
          </div>
        ))}
      </div>

      <div style={S.card}>
        <div style={{display:"flex",gap:10,padding:"16px 20px",borderBottom:"1px solid #f0f4f8",flexWrap:"wrap"}}>
          <div style={{position:"relative",flex:1,minWidth:180}}>
            <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:13}}>🔍</span>
            <input style={{...S.inp(false),paddingLeft:34}} placeholder="Search by name, batch or category..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/>
          </div>
          <select style={{...S.inp(false),width:"auto"}} value={catFilter} onChange={e=>{setCatFilter(e.target.value);setPage(1);}}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>

        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{background:"#f8fafc"}}>
                {["Medicine","Batch","Category","Supplier","Price","Stock","Expiry","Status","Actions"].map(h=>(
                  <th key={h} style={{padding:"12px 16px",textAlign:"left",fontSize:11,fontWeight:700,color:"#8a9ab5",textTransform:"uppercase",letterSpacing:"0.6px",whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? [1,2,3,4,5].map(i=>(
                <tr key={i}><td colSpan={9} style={{padding:"12px 16px"}}><div style={{height:20,background:"linear-gradient(90deg,#f0f4f8 25%,#e8eef5 50%,#f0f4f8 75%)",backgroundSize:"200% 100%",animation:"shimmer 1.2s infinite",borderRadius:8}}/></td></tr>
              )) : paginated.length === 0 ? (
                <tr><td colSpan={9} style={{textAlign:"center",padding:48,color:"#8a9ab5",fontSize:14}}>
                  <div style={{fontSize:36,marginBottom:8}}>🔍</div>
                  No medicines found
                </td></tr>
              ) : paginated.map(m => {
                const st = stockStatus(m);
                return (
                  <tr key={m.id} style={{borderTop:"1px solid #f0f4f8"}}
                    onMouseEnter={e=>e.currentTarget.style.background="#fafcff"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{padding:"13px 16px"}}>
                      <div style={{fontWeight:700,color:"#0d1b2a",fontSize:13}}>{m.name}</div>
                    </td>
                    <td style={{padding:"13px 16px",fontSize:12,color:"#6366f1",fontWeight:600}}>{m.batch_number||"—"}</td>
                    <td style={{padding:"13px 16px",fontSize:12,color:"#374151"}}>{m.category||"—"}</td>
                    <td style={{padding:"13px 16px",fontSize:12,color:"#374151"}}>{m.supplier_name||"—"}</td>
                    <td style={{padding:"13px 16px",fontWeight:700,color:"#00b89c",fontSize:13}}>KES {parseFloat(m.price).toFixed(2)}</td>
                    <td style={{padding:"13px 16px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontWeight:700,fontSize:13,color:m.stock===0?"#dc2626":m.stock<=m.min_stock?"#b45309":"#0d1b2a"}}>{m.stock}</span>
                        <div style={{width:50,height:5,background:"#f0f4f8",borderRadius:3,overflow:"hidden"}}>
                          <div style={{height:"100%",background:m.stock===0?"#ef4444":m.stock<=m.min_stock?"#f59e0b":"#00e5c0",borderRadius:3,width:`${Math.min((m.stock/(m.min_stock*2))*100,100)}%`}}/>
                        </div>
                      </div>
                    </td>
                    <td style={{padding:"13px 16px",fontSize:12,color:"#374151"}}>{m.expiry_date||"—"}</td>
                    <td style={{padding:"13px 16px"}}>
                      <span style={{fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:20,background:st.bg,color:st.color}}>{st.label}</span>
                    </td>
                    <td style={{padding:"13px 16px"}}>
                      <div style={{display:"flex",gap:6}}>
                        <button onClick={()=>openEdit(m)} style={{...S.btn("outline"),padding:"6px 10px",fontSize:12}}>✏️</button>
                        <button onClick={()=>{setDeleteTarget(m);setModal("delete");}} style={{...S.btn("danger"),padding:"6px 10px",fontSize:12}}>🗑</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{padding:"13px 20px",borderTop:"1px solid #f0f4f8",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontSize:12,color:"#8a9ab5",fontWeight:600}}>
            Showing {filtered.length === 0 ? 0 : Math.min((page-1)*PER_PAGE+1,filtered.length)}–{Math.min(page*PER_PAGE,filtered.length)} of {filtered.length}
          </div>
          <div style={{display:"flex",gap:6}}>
            <button disabled={page===1} onClick={()=>setPage(p=>p-1)} style={{...S.btn("outline"),padding:"6px 12px",opacity:page===1?0.4:1}}>← Prev</button>
            {Array.from({length:totalPages},(_,i)=>i+1).map(n=>(
              <button key={n} onClick={()=>setPage(n)} style={{padding:"6px 11px",borderRadius:8,border:"none",background:page===n?"#0d1b2a":"#f8fafc",color:page===n?"#fff":"#374151",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{n}</button>
            ))}
            <button disabled={page===totalPages||totalPages===0} onClick={()=>setPage(p=>p+1)} style={{...S.btn("outline"),padding:"6px 12px",opacity:page===totalPages||totalPages===0?0.4:1}}>Next →</button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modal==="form" && (
        <div style={{position:"fixed",inset:0,background:"rgba(13,27,42,0.5)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:20}}>
          <div style={{background:"#fff",borderRadius:20,width:"100%",maxWidth:560,boxShadow:"0 24px 64px rgba(0,0,0,0.15)",maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{padding:"22px 24px",borderBottom:"1px solid #f0f4f8",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,background:"#fff",zIndex:1}}>
              <div style={{fontSize:17,fontWeight:800,color:"#0d1b2a"}}>{editId?"✏️ Edit Medicine":"➕ Add Medicine"}</div>
              <button onClick={()=>setModal(null)} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:"#8a9ab5"}}>✕</button>
            </div>
            <div style={{padding:"22px 24px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              {[
                {key:"name",label:"Medicine Name",placeholder:"e.g. Amoxicillin 500mg",full:true},
                {key:"batch_number",label:"Batch Number",placeholder:"e.g. BATCH-2024-001"},
                {key:"price",label:"Price (KES)",placeholder:"e.g. 12.50"},
                {key:"stock",label:"Stock Quantity",placeholder:"e.g. 100"},
                {key:"min_stock",label:"Min Stock Level",placeholder:"e.g. 20"},
                {key:"expiry_date",label:"Expiry Date",type:"date"},
              ].map(({key,label,placeholder,type,full})=>(
                <div key={key} style={full?{gridColumn:"1/-1"}:{}}>
                  <label style={{fontSize:12,fontWeight:700,color:"#374151",display:"block",marginBottom:6}}>{label}</label>
                  <input style={S.inp(errors[key])} type={type||"text"} placeholder={placeholder} value={form[key]} onChange={e=>f(key,e.target.value)}/>
                  {errors[key]&&<div style={{fontSize:11,color:"#dc2626",marginTop:3}}>{errors[key]}</div>}
                </div>
              ))}
              <div>
                <label style={{fontSize:12,fontWeight:700,color:"#374151",display:"block",marginBottom:6}}>Category</label>
                <select style={S.inp(false)} value={form.category} onChange={e=>f("category",e.target.value)}>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{fontSize:12,fontWeight:700,color:"#374151",display:"block",marginBottom:6}}>Supplier</label>
                <select style={S.inp(false)} value={form.supplier_id} onChange={e=>f("supplier_id",e.target.value)}>
                  <option value="">Select supplier</option>
                  {suppliers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div style={{gridColumn:"1/-1"}}>
                <label style={{fontSize:12,fontWeight:700,color:"#374151",display:"block",marginBottom:6}}>Description</label>
                <textarea style={{...S.inp(false),resize:"vertical",minHeight:70}} placeholder="Optional description..." value={form.description} onChange={e=>f("description",e.target.value)}/>
              </div>
            </div>
            <div style={{padding:"16px 24px",borderTop:"1px solid #f0f4f8",display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button style={S.btn("outline")} onClick={()=>setModal(null)}>Cancel</button>
              <button style={S.btn("primary")} onClick={handleSave} disabled={saving}>{saving?"Saving...":editId?"Save Changes":"Add Medicine"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modal==="delete"&&deleteTarget&&(
        <div style={{position:"fixed",inset:0,background:"rgba(13,27,42,0.5)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:20}}>
          <div style={{background:"#fff",borderRadius:20,width:"100%",maxWidth:380,padding:28,boxShadow:"0 24px 64px rgba(0,0,0,0.15)",textAlign:"center"}}>
            <div style={{fontSize:44,marginBottom:14}}>🗑️</div>
            <div style={{fontSize:18,fontWeight:800,color:"#0d1b2a",marginBottom:8}}>Delete Medicine?</div>
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