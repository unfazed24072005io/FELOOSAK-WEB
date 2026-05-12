import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { Plus, Trash2, X, TrendingUp, TrendingDown, Wallet, Search, Filter, Calendar, ChevronDown, ChevronUp, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { api } from '../api';

export function CashInOut() {
  const [txs, setTxs] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('in');
  const [category, setCategory] = useState('sales');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'in' | 'out'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // LOAD BOOKS
  useEffect(() => {
    const loadBooks = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setLoading(false);
          return;
        }
        
        const booksList = await api.books.list();
        setBooks(booksList);
        
        if (booksList.length > 0) {
          setSelectedBookId(booksList[0].id);
          setSelectedBook(booksList[0]);
        }
      } catch (error) {
        console.error("Error loading books:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadBooks();
  }, []);

  // LOAD TRANSACTIONS when selected book changes
  useEffect(() => {
    const loadTransactions = async () => {
      if (!selectedBookId) return;
      
      try {
        const transactions = await api.transactions.list(selectedBookId);
        setTxs(transactions);
        
        const updatedBook = books.find(b => b.id === selectedBookId);
        if (updatedBook) {
          setSelectedBook({ ...updatedBook, tx: transactions });
        }
      } catch (error) {
        console.error("Error loading transactions:", error);
      }
    };
    
    loadTransactions();
  }, [selectedBookId, books]);

  // Filter transactions
  const filteredTransactions = txs.filter(tx => {
    const matchesSearch = searchTerm === '' || 
      tx.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.note?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || tx.type === filterType;
    return matchesSearch && matchesType;
  });

  const addTx = async () => {
    if (!selectedBookId || !amount) {
      alert("Please select a book and enter an amount");
      return;
    }
    
    try {
      await api.transactions.create({
        bookId: selectedBookId,
        type: type,
        amount: parseFloat(amount),
        category: category,
        note: note,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        payMode: "cash"
      });
      
      const transactions = await api.transactions.list(selectedBookId);
      setTxs(transactions);
      setShowAdd(false);
      setAmount('');
      setNote('');
      
    } catch (error) {
      console.error("Error adding transaction:", error);
      alert("Failed to add transaction");
    }
  };

  const delTx = async (id: string) => {
    try {
      await api.transactions.delete(parseInt(id));
      setTxs(txs.filter(t => t.id !== id));
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert("Failed to delete transaction");
    }
  };

  const totalIn = txs.filter(t => t.type === 'in').reduce((s, t) => s + t.amount, 0);
  const totalOut = txs.filter(t => t.type === 'out').reduce((s, t) => s + t.amount, 0);
  const balance = totalIn - totalOut;

  const formatCurrency = (amount: number) => `EGP ${amount.toFixed(2)}`;

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-gray-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-600 text-xs sm:text-sm">Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4 sm:p-6">
        <div className="text-center max-w-sm mx-auto">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Wallet size={28} className="text-gray-500 sm:w-8 sm:h-8" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Cash Books Yet</h2>
          <p className="text-gray-600 text-xs sm:text-sm mb-5 sm:mb-6">Create a cash book first to start tracking transactions</p>
          <button 
            onClick={() => window.location.href = '/cash'} 
            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-all shadow-md text-sm"
          >
            Go to Cash Books
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white pb-20 sm:pb-24">
      {/* Header */}
      <div className="px-4 py-3 sm:py-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Cash In / Out</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Manage your daily transactions</p>
      </div>

      <div className="px-4 space-y-4 sm:space-y-5">
        {/* Book Selector - Grey */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-gray-200 shadow-md">
          <label className="block text-[10px] sm:text-xs font-medium text-gray-600 mb-1.5 sm:mb-2 uppercase tracking-wide">Select Cash Book</label>
          <div className="relative">
            <select 
              value={selectedBookId} 
              onChange={(e) => setSelectedBookId(e.target.value)}
              className="w-full p-2.5 sm:p-3 pr-8 sm:pr-10 rounded-lg border border-gray-200 bg-gray-50/50 text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 appearance-none cursor-pointer"
            >
              {books.map(book => (
                <option key={book.id} value={book.id}>
                  {book.icon} {book.name} ({book.type})
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none sm:w-4 sm:h-4" />
          </div>
        </div>

        {/* Main Gradient Card - Green to Cream */}
        <div className="relative rounded-2xl overflow-hidden shadow-lg h-40">
          <div className="absolute inset-0 rounded-2xl" style={{ background: 'radial-gradient(circle at 14% 50%, #059669, #FEF3C7, #FFFFFF)' }} />
          <div className="relative p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <TrendingUp size={16} className="text-white sm:w-5 sm:h-5" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-medium text-white/80 uppercase tracking-wide">Total Cash In</p>
                  <p className="text-lg sm:text-2xl font-bold text-white break-words">{formatCurrency(totalIn)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[8px] sm:text-[10px] text-white/60">All time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Stats Cards Row - Responsive */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 -mt-14 sm:-mt-22 relative z-10">
          <div className="bg-white rounded-xl p-2 sm:p-3 shadow-md border border-gray-100 text-center">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-1">
              <TrendingUp size={12} className="text-gray-600 sm:w-3.5 sm:h-3.5" />
            </div>
            <p className="text-[8px] sm:text-[10px] font-medium text-gray-500 uppercase">Cash In</p>
            <p className="text-xs sm:text-sm font-bold text-gray-900 break-words">{formatCurrency(totalIn)}</p>
          </div>
          <div className="bg-white rounded-xl p-2 sm:p-3 shadow-md border border-gray-100 text-center">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-1">
              <TrendingDown size={12} className="text-gray-600 sm:w-3.5 sm:h-3.5" />
            </div>
            <p className="text-[8px] sm:text-[10px] font-medium text-gray-500 uppercase">Cash Out</p>
            <p className="text-xs sm:text-sm font-bold text-gray-900 break-words">{formatCurrency(totalOut)}</p>
          </div>
          <div className="bg-white rounded-xl p-2 sm:p-3 shadow-md border border-gray-100 text-center">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-1">
              <Wallet size={12} className="text-gray-600 sm:w-3.5 sm:h-3.5" />
            </div>
            <p className="text-[8px] sm:text-[10px] font-medium text-gray-500 uppercase">Net Balance</p>
            <p className={`text-xs sm:text-sm font-bold ${balance >= 0 ? 'text-emerald-600' : 'text-rose-600'} break-words`}>
              {formatCurrency(balance)}
            </p>
          </div>
        </div>

        {/* Filter Bar - Grey Selectors - Horizontal Scroll on Mobile */}
        <div className="bg-white rounded-xl p-1 shadow-md border border-gray-200 mt-1 sm:mt-2 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            <button
              onClick={() => setFilterType('all')}
              className={`flex-1 py-1.5 sm:py-2.5 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${filterType === 'all' ? 'bg-gray-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              All Transactions
            </button>
            <button
              onClick={() => setFilterType('in')}
              className={`flex-1 py-1.5 sm:py-2.5 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${filterType === 'in' ? 'bg-gray-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Cash In
            </button>
            <button
              onClick={() => setFilterType('out')}
              className={`flex-1 py-1.5 sm:py-2.5 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${filterType === 'out' ? 'bg-gray-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Cash Out
            </button>
          </div>
        </div>

        {/* Search Bar - Grey */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 sm:w-4 sm:h-4" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 sm:pl-9 pr-8 sm:pr-10 py-2.5 sm:py-3 rounded-xl border border-gray-200 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 placeholder:text-gray-400"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X size={12} className="text-gray-400 hover:text-gray-600 sm:w-3.5 sm:h-3.5" />
            </button>
          )}
        </div>

        {/* Transactions List - Grey */}
        <div className="space-y-2 pb-4">
          <div className="flex items-center justify-between px-1">
            <p className="text-[10px] sm:text-xs text-gray-500">
              {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
            </p>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 text-center border border-gray-200">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Wallet size={20} className="text-gray-400 sm:w-6 sm:h-6" />
              </div>
              <p className="text-sm sm:text-base text-gray-500 font-medium">No transactions found</p>
              <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                {searchTerm ? 'Try a different search term' : 'Click the + button to add your first transaction'}
              </p>
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const isIncome = tx.type === 'in';
              return (
                <div key={tx.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-gray-200 shadow-md hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isIncome ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                      {isIncome ? <ArrowUpRight size={14} className="text-emerald-600 sm:w-4.5 sm:h-4.5" /> : <ArrowDownLeft size={14} className="text-rose-600 sm:w-4.5 sm:h-4.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{tx.category}</p>
                        <span className={`text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded-full ${isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {isIncome ? 'Income' : 'Expense'}
                        </span>
                      </div>
                      {tx.note && <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 truncate">{tx.note}</p>}
                      <p className="text-[8px] sm:text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                        <Calendar size={8} className="sm:w-2.5 sm:h-2.5" />
                        {tx.date}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-xs sm:text-base font-bold ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                      </p>
                      <button onClick={() => delTx(tx.id)} className="mt-1 text-gray-400 hover:text-rose-500 transition-colors">
                        <Trash2 size={12} className="sm:w-3.5 sm:h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Floating Action Button - Grey */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-gray-600 text-white rounded-full shadow-lg shadow-gray-500/30 flex items-center justify-center active:scale-95 transition-all duration-200 hover:bg-gray-700"
      >
        <Plus size={20} className="sm:w-6 sm:h-6" />
      </button>

      {/* Add Transaction Modal - Grey Theme - Responsive */}
      {showAdd && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setShowAdd(false)} />
          <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-xl animate-slide-up">
            <div className="p-4 sm:p-5 max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4 sm:mb-5">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">Add Transaction</h2>
                  <p className="text-[10px] sm:text-xs text-gray-500">to {selectedBook?.icon} {selectedBook?.name}</p>
                </div>
                <button onClick={() => setShowAdd(false)} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <X size={16} className="text-gray-500 sm:w-4.5 sm:h-4.5" />
                </button>
              </div>
              
              {/* Type Selection - Grey */}
              <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-5">
                <button 
                  onClick={() => setType('in')} 
                  className={`flex-1 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${type === 'in' ? 'bg-gray-600 text-white shadow-md' : 'bg-gray-50 text-gray-600'}`}
                >
                  ↓ Cash In
                </button>
                <button 
                  onClick={() => setType('out')} 
                  className={`flex-1 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${type === 'out' ? 'bg-gray-600 text-white shadow-md' : 'bg-gray-50 text-gray-600'}`}
                >
                  ↑ Cash Out
                </button>
              </div>
              
              {/* Amount Input - Grey */}
              <div className="mb-3 sm:mb-4">
                <label className="block text-[10px] sm:text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-xs sm:text-sm">EGP</span>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    value={amount} 
                    onChange={e => setAmount(e.target.value)} 
                    className="w-full pl-12 sm:pl-14 pr-3 py-2.5 sm:py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-base sm:text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-gray-500"
                    autoFocus
                  />
                </div>
              </div>

              {/* Category Select - Grey */}
              <div className="mb-3 sm:mb-4">
                <label className="block text-[10px] sm:text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">Category</label>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value)}
                  className="w-full p-2.5 sm:p-3 rounded-xl border border-gray-200 bg-gray-50/50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-700"
                >
                  <option value="sales">💰 Sales</option>
                  <option value="services">🛠️ Services</option>
                  <option value="rent">🏠 Rent</option>
                  <option value="salaries">👥 Salaries</option>
                  <option value="utilities">💡 Utilities</option>
                  <option value="transport">🚗 Transport</option>
                  <option value="food">🍔 Food</option>
                  <option value="maintenance">🔧 Maintenance</option>
                  <option value="other">📦 Other</option>
                </select>
              </div>
              
              {/* Note Input - Grey */}
              <div className="mb-4 sm:mb-5">
                <label className="block text-[10px] sm:text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">Note (Optional)</label>
                <input 
                  type="text" 
                  placeholder="Add a note..." 
                  value={note} 
                  onChange={e => setNote(e.target.value)} 
                  className="w-full p-2.5 sm:p-3 rounded-xl border border-gray-200 bg-gray-50/50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
              </div>
              
              {/* Submit Button - Grey */}
              <button 
                onClick={addTx} 
                className="w-full py-3 sm:py-3.5 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all active:scale-[0.98] shadow-md text-sm sm:text-base"
              >
                Save Transaction
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}