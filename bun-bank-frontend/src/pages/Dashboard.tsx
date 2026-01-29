import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

// 1. Perbaiki Interface (Balance bisa string atau number biar aman)
interface Account {
  id: number;
  userId: number;
  accountNumber: string;
  accountName?: string;
  balance: number | string; // 👈 UBAH JADI INI BIAR GAK CRASH
}

interface Transaction {
  id: number;
  type: string;
  amount: number | string;
  balanceBefore: number | string;
  balanceAfter: number | string;
  description?: string;
  referenceNumber: string;
  createdAt: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'NEW_ACCOUNT' | 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER' | null>(null);

  // Form Input
  const [amount, setAmount] = useState<number>(0);
  const [targetAccount, setTargetAccount] = useState('');
  const [description, setDescription] = useState('');
  const [newAccountName, setNewAccountName] = useState('');

  // 2. Bungkus Fetch pake useCallback (Solusi Warning useEffect)
  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/accounts');
      
      // 3. Validasi Data (Solusi Dashboard Blank)
      // Kalau backend error/balikin null, kita kasih array kosong biar gak crash
      const list = Array.isArray(res.data.data) ? res.data.data : [];
      
      setAccounts(list);
      
      if (list.length > 0 && !selectedAccount) {
        setSelectedAccount(list[0]);
      }
    } catch (error: any) {
      console.error("Gagal load akun:", error);
      // Kalau 401 (Unauthorized), tendang ke login
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, selectedAccount]); // Dependency array lengkap

  const fetchHistory = useCallback(async (accNum: string) => {
    try {
      const res = await api.get(`/transactions/${accNum}`);
      setTransactions(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (error) {
      console.error("Gagal ambil history", error);
      setTransactions([]); // Set kosong kalau error
    }
  }, []);

  // Effect Load Awal
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Effect Ganti Akun
  useEffect(() => {
    if (selectedAccount) {
      fetchHistory(selectedAccount.accountNumber);
    }
  }, [selectedAccount, fetchHistory]);

  // --- Helper Format Duit (Biar String/Number tetep cantik) ---
  const formatRupiah = (angka: number | string) => {
    const val = Number(angka); // Paksa jadi number
    return isNaN(val) ? '0' : val.toLocaleString('id-ID');
  };

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
        await api.post('/accounts', { accountName: newAccountName });
        alert('Rekening Berhasil Dibuat!');
        closeModal();
        fetchAccounts();
        return;
      }

      await api.post(endpoint, payload);
      alert('Transaksi Berhasil!');
      closeModal();
      
      // Refresh Data (Panggil ulang fetch)
      fetchAccounts(); 
      // Reset history juga
      if (selectedAccount) fetchHistory(selectedAccount.accountNumber);
      
    } catch (error: any) {
      alert(error.response?.data?.message || 'Transaksi Gagal');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type: any) => {
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

      <main className="flex-1 container mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Kolom KIRI: Daftar Rekening */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-700 mb-4">Dompet Saya</h2>
            
            <div className="space-y-4">
              {accounts.length === 0 && !loading && <p className="text-gray-400 text-center">Belum ada rekening</p>}
              
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
                  {/* Pake Helper Format Duit */}
                  <p className="text-xl font-bold text-indigo-700">Rp {formatRupiah(acc.balance)}</p>
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

        {/* Kolom KANAN */}
        <div className="lg:col-span-2 space-y-6">
          {selectedAccount ? (
            <>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex gap-4 overflow-x-auto">
                <button onClick={() => openModal('DEPOSIT')} className="flex-1 p-4 rounded-xl bg-green-100 text-green-700 hover:scale-105 transition font-bold">📥 Deposit</button>
                <button onClick={() => openModal('WITHDRAW')} className="flex-1 p-4 rounded-xl bg-orange-100 text-orange-700 hover:scale-105 transition font-bold">📤 Withdraw</button>
                <button onClick={() => openModal('TRANSFER')} className="flex-1 p-4 rounded-xl bg-blue-100 text-blue-700 hover:scale-105 transition font-bold">💸 Transfer</button>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Riwayat Transaksi</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th className="px-4 py-3">Tanggal</th>
                        <th className="px-4 py-3">Tipe</th>
                        <th className="px-4 py-3 text-right">Nominal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.length === 0 ? (
                        <tr><td colSpan={3} className="text-center py-4">Belum ada transaksi</td></tr>
                      ) : (
                        transactions.map((tx) => (
                          <tr key={tx.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3">{new Date(tx.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-3">{tx.type}</td>
                            <td className={`px-4 py-3 text-right font-bold ${
                                String(tx.type).includes('IN') || tx.type === 'DEPOSIT' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {String(tx.type).includes('IN') || tx.type === 'DEPOSIT' ? '+' : '-'} Rp {formatRupiah(tx.amount)}
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

      {/* --- MODAL POPUP --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">{modalType}</h3>
            
            <div className="space-y-4">
              {modalType === 'NEW_ACCOUNT' ? (
                 <input type="text" className="w-full p-2 border rounded" placeholder="Nama Tabungan" value={newAccountName} onChange={(e) => setNewAccountName(e.target.value)} />
              ) : (
                <>
                  <input type="number" className="w-full p-2 border rounded" placeholder="Nominal" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
                  {modalType === 'TRANSFER' && (
                    <>
                      <input type="text" className="w-full p-2 border rounded" placeholder="Rekening Tujuan" value={targetAccount} onChange={(e) => setTargetAccount(e.target.value)} />
                      <input type="text" className="w-full p-2 border rounded" placeholder="Catatan" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </>
                  )}
                </>
              )}
              <div className="flex gap-3 mt-4">
                <button onClick={closeModal} className="flex-1 py-2 bg-gray-200 rounded">Batal</button>
                <button onClick={handleTransaction} disabled={loading} className="flex-1 py-2 bg-indigo-600 text-white rounded">Proses</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}