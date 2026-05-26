export const uid = () => Math.random().toString(36).slice(2, 9);

// Always use current month/year
const NOW  = new Date();
const CY   = NOW.getFullYear();
const CM   = NOW.getMonth(); // 0-indexed
const CM1  = CM + 1;         // 1-indexed
const CMONTH_STR = NOW.toLocaleString("en-IN", { month: "long", year: "numeric" });

// Helper: date string for current month
const d = (day) => `${CY}-${String(CM1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

// Last 6 months labels
const last6 = () => {
  const arr = [];
  for (let i = 5; i >= 0; i--) {
    const dt = new Date(CY, CM - i, 1);
    arr.push(dt.toLocaleString("en-IN", { month: "short" }));
  }
  return arr;
};
const M6 = last6();

export const CURRENT_MONTH_STR = CMONTH_STR;

export const MONTHLY_CHART = [
  { m: M6[0], inc: 48000, exp: 29000, sav: 19000 },
  { m: M6[1], inc: 52000, exp: 35000, sav: 17000 },
  { m: M6[2], inc: 45000, exp: 28000, sav: 17000 },
  { m: M6[3], inc: 53000, exp: 31000, sav: 22000 },
  { m: M6[4], inc: 48000, exp: 26000, sav: 22000 },
  { m: M6[5], inc: 56000, exp: 27900, sav: 28100 },
];

export const NW_HIST = [
  { m: M6[0], nw: 380000 }, { m: M6[1], nw: 395000 },
  { m: M6[2], nw: 402000 }, { m: M6[3], nw: 421000 },
  { m: M6[4], nw: 445000 }, { m: M6[5], nw: 460500 },
];

export const CAT_COLORS = {
  EMI:"#b02828", Rent:"#5c2d9a", Shopping:"#1e4d96",
  Food:"#8a5c0a", Utilities:"#2a6e45", Health:"#c8732a",
  Travel:"#1a6e7a", Entertainment:"#7a3fa0", Other:"#6b5f52",
  Salary:"#1f6b3a", Freelance:"#1a4a96", Dividend:"#5a2898", Bonus:"#7a5208",
};

export const TX_CATS = [
  "Salary","Freelance","Dividend","Bonus",
  "Food","Travel","EMI","Utilities","Shopping",
  "Entertainment","Health","Rent","Other",
];

export const ASSET_TYPES = ["Cash","Investment","Property","Vehicle","Other"];
export const LIAB_TYPES  = ["Loan","Credit Card","Mortgage","Other"];
export const BDG_CATS    = ["Food","Travel","Shopping","Entertainment","Health","Utilities","Rent","EMI","Other"];

export const SEED = () => {
  // EMI payment months (last 4 paid, next 4 upcoming)
  const emiMonths = [];
  for (let i = -3; i <= 4; i++) {
    const dt = new Date(CY, CM + i, 1);
    emiMonths.push({
      id: uid(),
      m: dt.toLocaleString("en-IN", { month: "short", year: "numeric" }),
      amt: 21700, prin: 9200 + i * 65, int: 12500 - i * 65,
      done: i <= 0,
    });
  }
  const emiMonths2 = [];
  for (let i = -3; i <= 2; i++) {
    const dt = new Date(CY, CM + i, 1);
    emiMonths2.push({
      id: uid(),
      m: dt.toLocaleString("en-IN", { month: "short", year: "numeric" }),
      amt: 3620, prin: 2470 + i * 29, int: 1150 - i * 29,
      done: i <= 0,
    });
  }

  return {
    txns: [
      { id:uid(), type:"income",  amount:45000, category:"Salary",        description:"Monthly salary",         date:d(1)  },
      { id:uid(), type:"expense", amount:5000,  category:"Rent",          description:"Room rent",              date:d(1)  },
      { id:uid(), type:"expense", amount:3200,  category:"Food",          description:"Grocery and dining",     date:d(3)  },
      { id:uid(), type:"expense", amount:1500,  category:"Travel",        description:"Cab and fuel",           date:d(5)  },
      { id:uid(), type:"expense", amount:8500,  category:"EMI",           description:"Home loan EMI",          date:d(7)  },
      { id:uid(), type:"income",  amount:8000,  category:"Freelance",     description:"Web design project",     date:d(10) },
      { id:uid(), type:"expense", amount:2100,  category:"Utilities",     description:"Electricity & internet", date:d(12) },
      { id:uid(), type:"expense", amount:4200,  category:"Shopping",      description:"Clothes and accessories",date:d(15) },
      { id:uid(), type:"expense", amount:999,   category:"Entertainment", description:"OTT subscriptions",      date:d(18) },
      { id:uid(), type:"income",  amount:3000,  category:"Dividend",      description:"Stock dividend",         date:d(20) },
      { id:uid(), type:"expense", amount:1800,  category:"Health",        description:"Gym and pharmacy",       date:d(22) },
      { id:uid(), type:"expense", amount:600,   category:"Food",          description:"Coffee and snacks",      date:d(Math.min(24,28)) },
    ],
    loans: [
      {
        id:uid(), lender:"SBI Home Loans", principal:2500000, rate:8.5,
        months:240, start:"2023-01-10", paid:568400, status:"active",
        payments: emiMonths,
      },
      {
        id:uid(), lender:"Bajaj Finserv", principal:75000, rate:14,
        months:24, start:"2024-06-01", paid:36200, status:"active",
        payments: emiMonths2,
      },
      {
        id:uid(), lender:"HDFC Personal", principal:50000, rate:12.5,
        months:12, start:"2024-01-01", paid:50000, status:"closed",
        payments:[],
      },
    ],
    goals:[
      { id:uid(), name:"Emergency Fund",          target:200000, saved:82000, deadline:`${CY}-12-31`     },
      { id:uid(), name:"Europe Trip",             target:150000, saved:45000, deadline:`${CY+1}-03-31`   },
      { id:uid(), name:"New Laptop",              target:80000,  saved:80000, deadline:`${CY}-02-28`     },
      { id:uid(), name:"Investment Portfolio 5L", target:500000, saved:157000,deadline:`${CY+2}-01-01`   },
    ],
    budgets:[
      { id:uid(), category:"Food",          limit:5000, spent:3800, month:CM1, year:CY },
      { id:uid(), category:"Travel",        limit:3000, spent:1500, month:CM1, year:CY },
      { id:uid(), category:"Shopping",      limit:3000, spent:4200, month:CM1, year:CY },
      { id:uid(), category:"Entertainment", limit:1500, spent:999,  month:CM1, year:CY },
      { id:uid(), category:"Health",        limit:2500, spent:1800, month:CM1, year:CY },
      { id:uid(), category:"Utilities",     limit:2500, spent:2100, month:CM1, year:CY },
    ],
    assets:[
      { id:uid(), name:"SBI Savings Account", type:"Cash",       value:82000  },
      { id:uid(), name:"HDFC Fixed Deposit",  type:"Investment", value:150000 },
      { id:uid(), name:"Mutual Funds Axis",   type:"Investment", value:95000  },
      { id:uid(), name:"Stocks Portfolio",    type:"Investment", value:62000  },
      { id:uid(), name:"Gold 20g",            type:"Property",   value:130000 },
    ],
    liabs:[
      { id:uid(), name:"Home Loan SBI",       type:"Loan",        owed:850000, due:`${CY}-${String(CM1+1>12?1:CM1+1).padStart(2,"0")}-07` },
      { id:uid(), name:"Credit Card ICICI",   type:"Credit Card", owed:18500,  due:`${CY}-${String(CM1+1>12?1:CM1+1).padStart(2,"0")}-02` },
      { id:uid(), name:"Personal Loan Bajaj", type:"Loan",        owed:42000,  due:`${CY}-${String(CM1+1>12?1:CM1+1).padStart(2,"0")}-15` },
    ],
  };
};
