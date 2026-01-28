import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

// --- Tipe Data (Sesuai Backend) ---
interface Account {
  id: number;
  userId: number;
  accountNumber: string;
  accountName?: string;
  balance: number;
}

interface Transaction {
  id: number;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description?: string;
  referenceNumber: string;
  createdAt: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  
  // State Data
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  // State Modal (Popup)
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'NEW_ACCOUNT' | 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER' | null>(null);

  // Form Input
  const [amount, setAmount] = useState<number>(0);
  const [targetAccount, setTargetAccount] = useState('');
  const [description, setDescription] = useState('');
  const [newAccountName, setNewAccountName] = useState('');

  // 1. Load Data Awal
  useEffect(() => {
    fetchAccounts();
  }, []);

  // 2. Load History kalau ganti akun
  useEffect(() => {
    if (selectedAccount) {
      fetchHistory(selectedAccount.accountNumber);
    }
  }, [selectedAccount]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/accounts');
      const list = res.data.data;
      setAccounts(list);
      
      // Auto-select akun pertama kalau ada
      if (list.length > 0 && !selectedAccount) {
        setSelectedAccount(list[0]);
      }
    } catch (error) {
      console.error(error);
      if ((error as any).response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (accNum: string) => {
    try {
      const res = await api.get(`/transactions/${accNum}`);
      setTransactions(res.data.data);
    } catch (error) {
      console.error("Gagal ambil history", error);
    }
  };

  // --- Logic Transaksi ---
  const handleTransaction = async () => {
    if (!selectedAccount) return;
    
    try {
      setLoading(true);
      let endpoint = '';
      let payload: any = {};

      if (modalType === 'DEPOSIT') {
        endpoint = '/transactions/deposit';
        payload = { accountNumber: selectedAccount.accountNumber, amount: Number(amount) };
      } else if (modalType === 'WITHDRAW') {
        endpoint = '/transactions/withdraw';
        payload = { accountNumber: selectedAccount.accountNumber, amount: Number(amount) };
      } else if (modalType === 'TRANSFER') {
        endpoint = '/transactions/transfer';
        payload = { 
          fromAccountNumber: selectedAccount.accountNumber, 
          toAccountNumber: targetAccount, 
          amount: Number(amount),
          description 
        };
      } else if (modalType === 'NEW_ACCOUNT') {
        // Khusus Buka Rekening
        await api.post('/accounts', { accountName: newAccountName });
        alert('Rekening Berhasil Dibuat!');
        closeModal();
        fetchAccounts(); // Refresh list
        return;
      }

      // Eksekusi Transaksi Uang
      await api.post(endpoint, payload);
      alert('Transaksi Berhasil!');
      closeModal();
      
      // Refresh Data
      fetchAccounts(); 
      fetchHistory(selectedAccount.accountNumber);
      
    } catch (error: any) {
      alert(error.response?.data?.message || 'Transaksi Gagal');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type: 'NEW_ACCOUNT' | 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER') => {
    setModalType(type);
    setShowModal(true);
    setAmount(0);
    setTargetAccount('');
    setDescription('');
    setNewAccountName('');
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-indigo-700 text-white p-4 shadow-lg flex justify-between items-center">
        <div className="flex items-center gap-2">
           <span className="text-2xl">🏦</span>
           <h1 className="text-xl font-bold tracking-wide">Bun Bank</h1>
        </div>
        <button onClick={() => { localStorage.removeItem('token'); navigate('/'); }} 
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm font-semibold transition">
          Logout
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Kolom KIRI: Daftar Rekening */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-700 mb-4">Dompet Saya</h2>
            
            {/* List Account Cards */}
            <div className="space-y-4">
              {accounts.map((acc) => (
                <div 
                  key={acc.id} 
                  onClick={() => setSelectedAccount(acc)}
                  className={`p-4 rounded-lg cursor-pointer border-2 transition ${
                    selectedAccount?.id === acc.id 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-transparent bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <p className="font-bold text-gray-800">{acc.accountName || 'Rekening Utama'}</p>
                  <p className="text-sm text-gray-500 font-mono mb-2">{acc.accountNumber}</p>
                  <p className="text-xl font-bold text-indigo-700">Rp {acc.balance.toLocaleString('id-ID')}</p>
                </div>
              ))}
            </div>

            <button 
              onClick={() => openModal('NEW_ACCOUNT')}
              className="w-full mt-6 py-3 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-indigo-500 hover:text-indigo-600 transition font-semibold"
            >
              + Buka Rekening Baru
            </button>
          </div>
        </div>

        {/* Kolom KANAN: Detail & Transaksi */}
        <div className="lg:col-span-2 space-y-6">
          {selectedAccount ? (
            <>
              {/* Action Buttons */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex gap-4 overflow-x-auto">
                <ActionButton label="Deposit" icon="📥" color="bg-green-100 text-green-700" onClick={() => openModal('DEPOSIT')} />
                <ActionButton label="Withdraw" icon="📤" color="bg-orange-100 text-orange-700" onClick={() => openModal('WITHDRAW')} />
                <ActionButton label="Transfer" icon="💸" color="bg-blue-100 text-blue-700" onClick={() => openModal('TRANSFER')} />
              </div>

              {/* Transaction History */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Riwayat Transaksi</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th className="px-4 py-3">Tanggal</th>
                        <th className="px-4 py-3">Tipe</th>
                        <th className="px-4 py-3">Deskripsi</th>
                        <th className="px-4 py-3 text-right">Nominal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.length === 0 ? (
                        <tr><td colSpan={4} className="text-center py-4">Belum ada transaksi</td></tr>
                      ) : (
                        transactions.map((tx) => (
                          <tr key={tx.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3">{new Date(tx.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-3 font-semibold">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                tx.type.includes('IN') || tx.type === 'DEPOSIT' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {tx.type}
                              </span>
                            </td>
                            <td className="px-4 py-3">{tx.description || '-'}</td>
                            <td className={`px-4 py-3 text-right font-bold ${
                               tx.type.includes('IN') || tx.type === 'DEPOSIT' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {tx.type.includes('IN') || tx.type === 'DEPOSIT' ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              Pilih rekening dulu di sebelah kiri
            </div>
          )}
        </div>
      </main>

      {/* --- MODAL / POPUP --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all scale-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {modalType === 'NEW_ACCOUNT' && 'Buka Rekening Baru'}
              {modalType === 'DEPOSIT' && 'Setor Tunai'}
              {modalType === 'WITHDRAW' && 'Tarik Tunai'}
              {modalType === 'TRANSFER' && 'Transfer Uang'}
            </h3>

            <div className="space-y-4">
              {modalType === 'NEW_ACCOUNT' ? (
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Nama Tabungan</label>
                   <input 
                      type="text" 
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
                      placeholder="Misal: Tabungan Nikah"
                      value={newAccountName}
                      onChange={(e) => setNewAccountName(e.target.value)}
                   />
                 </div>
              ) : (
                <>
                  {/* Input Amount (Untuk Semua Transaksi) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nominal (Rp)</label>
                    <input 
                      type="number" 
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                    />
                  </div>

                  {/* Input Khusus Transfer */}
                  {modalType === 'TRANSFER' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rekening Tujuan</label>
                        <input 
                          type="text" 
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
                          placeholder="BNIxxxxxx"
                          value={targetAccount}
                          onChange={(e) => setTargetAccount(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                        <input 
                          type="text" 
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
                          placeholder="Bayar utang..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              <div className="flex gap-3 mt-6">
                <button onClick={closeModal} className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded">Batal</button>
                <button 
                  onClick={handleTransaction} 
                  disabled={loading}
                  className="flex-1 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400"
                >
                  {loading ? 'Proses...' : 'Konfirmasi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Komponen Kecil Tombol
function ActionButton({ label, icon, color, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl transition hover:scale-105 ${color}`}
    >
      <span className="text-2xl mb-1">{icon}</span>
      <span className="font-bold text-sm">{label}</span>
    </button>
  );
}