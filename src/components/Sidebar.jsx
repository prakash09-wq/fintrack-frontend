import { useAuth } from "../context/AuthContext";

const NAVS = [
  { id: "dash",     l: "Dashboard",   g: 0 },
  { id: "txn",      l: "Transactions",g: 0 },
  { id: "networth", l: "Net Worth",   g: 0 },
  { id: "loans",    l: "Loans & EMI", g: 0 },
  { id: "goals",    l: "Goals",       g: 1 },
  { id: "budget",   l: "Budget",      g: 1 },
  { id: "analysis", l: "Analysis",    g: 1 },
  { id: "reports",  l: "Reports",     g: 1 },
];

export default function Sidebar({ page, setPage, open, onClose }) {
  const { user, logout } = useAuth();
  const initials = user?.name?.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "U";

  const handleNav = (id) => { setPage(id); if (onClose) onClose(); };

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar${open ? " open" : ""}`}>
        <div className="sbt">
          <div className="logo">
            <div className="logo-ic">Ft</div>
            <div className="logo-nm">Fin<span>Track</span></div>
          </div>
        </div>
        <nav className="sbnav">
          <div className="sbsec">Track</div>
          {NAVS.filter((n) => n.g === 0).map((n) => (
            <button key={n.id} className={`sbtn${page === n.id ? " on" : ""}`} onClick={() => handleNav(n.id)}>
              {n.l}
            </button>
          ))}
          <div className="sbsec">Plan & Analyse</div>
          {NAVS.filter((n) => n.g === 1).map((n) => (
            <button key={n.id} className={`sbtn${page === n.id ? " on" : ""}`} onClick={() => handleNav(n.id)}>
              {n.l}
            </button>
          ))}
        </nav>
        <div className="sbft">
          <div className="urow" onClick={logout} title="Click to sign out">
            <div className="uav">
              {user?.photo
                ? <img src={user.photo} alt="" referrerPolicy="no-referrer" />
                : initials
              }
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="unm">{user?.name}</div>
              <div className="usb">sign out →</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
