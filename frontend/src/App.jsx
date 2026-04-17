import React, { useState, useEffect } from 'react';

const API_BASE = '/api';

export default function BusinessSite() {
  const [view, setView] = useState('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', price: '', image: '', category: '' });
  const [addForm, setAddForm] = useState({ name: '', price: '', image: '', category: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/products`);
      const data = await response.json();
      setProducts(data.products);
    } catch (error) {
      console.log('Fetch products error');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    try {
      const response = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (result.success) {
        setIsLoggedIn(true);
        setView('admin');
        fetchProducts();
      } else {
        setLoginError(result.message || 'Login failed');
      }
    } catch (error) {
      setLoginError('Server error');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/api/logout`);
    } catch (error) {
      console.log('Logout error');
    }
    setIsLoggedIn(false);
    setView('customer');
    setEmail('');
    setPassword('');
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_BASE}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm)
      });
      setAddForm({ name: '', price: '', image: '', category: '' });
      fetchProducts();
    } catch (error) {
      console.log('Add error');
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setEditForm(product);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_BASE}/api/products/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      setEditingId(null);
      setEditForm({ name: '', price: '', image: '', category: '' });
      fetchProducts();
    } catch (error) {
      console.log('Update error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await fetch(`${API_BASE}/api/products/${id}`, { method: 'DELETE' });
      fetchProducts();
    } catch (error) {
      console.log('Delete error');
    }
  };

  const CustomerView = () => (
    <>
      <header className="max-w-6xl mx-auto mb-10">
        <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-lg shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Tech Solutions Store</h1>
            <p className="text-gray-500">Professional Services & Hardware</p>
          </div>
          <div className="flex items-center space-x-4">
            <a href="#about" className="text-gray-600 hover:text-blue-600 font-medium transition">About</a>
            <button onClick={() => setView('login')} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
              Admin
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.length === 0 ? (
            <div className="col-span-full text-center py-20 text-gray-400">
              No products available yet. Check back soon!
            </div>
          ) : products.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md border transition-all">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-50 rounded-lg flex items-center justify-center">
                <img src={item.image} alt={item.name} className="w-16 h-16 object-contain" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2 text-center">{item.name}</h3>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-3 text-center">{item.category}</p>
              <p className="text-2xl font-bold text-blue-600 text-center">K{item.price}</p>
            </div>
          ))}
        </div>

        {/* About Section */}
        <section id="about" className="mt-20 bg-white p-10 rounded-2xl shadow-sm border">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 border-b pb-4">Professional Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="flex items-center text-gray-700">
                <span className="w-32 font-semibold">Occupation:</span>
                <span>IT Solutions Specialist</span>
              </div>
              <div className="flex items-center text-gray-700">
                <span className="w-32 font-semibold">Location:</span>
                <span>Lusaka, Zambia</span>
              </div>
              <div className="flex items-center text-gray-700">
                <span className="w-32 font-semibold">Contact:</span>
                <a href="mailto:business@gmail.com" className="text-blue-600 hover:underline">business@gmail.com</a>
              </div>
            </div>
            <div className="text-gray-600 leading-relaxed">
              <p>Specializing in software deployment, hardware diagnostics, and high-performance system optimization. I provide top-tier technical services to help maintain a seamless digital environment for businesses and individual professionals.</p>
              <p className="mt-4 font-medium text-gray-800 italic">"Committed to delivering excellence in every technical challenge."</p>
            </div>
          </div>
        </section>
      </main>
      <footer className="mt-20 text-center border-t pt-10 pb-16">
        <div className="flex justify-center space-x-8 text-gray-400 mb-6">
          <a href="#" className="hover:text-blue-600 transition">Facebook</a>
          <a href="#" className="hover:text-blue-400 transition">Telegram</a>
          <a href="#" className="hover:text-pink-600 transition">Instagram</a>
        </div>
        <p className="text-gray-500 text-sm">© 2024 Tech Solutions Store. All rights reserved.</p>
      </footer>
    </>
  );

  const LoginForm = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Admin Login</h2>
        {loginError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{loginError}</div>}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="business@gmail.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="123456" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <button onClick={() => setView('customer')} className="w-full mt-6 text-blue-600 hover:text-blue-800 font-medium">
          Back to Store
        </button>
      </div>
    </div>
  );

  const AdminDashboard = () => (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-lg border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <div className="space-x-3">
            <button onClick={() => setView('customer')} className="text-blue-600 hover:text-blue-800 font-medium">Store</button>
            <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-8">
        {/* Add Product Form */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Add New Product</h2>
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input value={addForm.name} onChange={(e) => setAddForm({...addForm, name: e.target.value})} placeholder="Product Name" className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
            <input value={addForm.price} onChange={(e) => setAddForm({...addForm, price: e.target.value})} placeholder="Price (K)" className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
            <input value={addForm.image} onChange={(e) => setAddForm({...addForm, image: e.target.value})} placeholder="Image URL" className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 md:col-span-2" required />
            <select value={addForm.category} onChange={(e) => setAddForm({...addForm, category: e.target.value})} className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 md:col-span-2" required>
              <option value="">Select Category</option>
              <option value="Gloseries">Gloseries</option>
              <option value="Electronic Gadgets">Electronic Gadgets</option>
              <option value="Software">Software</option>
              <option value="Storage">Storage</option>
            </select>
            <button type="submit" className="md:col-span-2 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition">Add Product</button>
          </form>
        </div>

        {/* Products List */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6">Products ({products.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="border rounded-xl p-6 hover:shadow-md transition">
                <img src={product.image} alt={product.name} className="w-20 h-20 mx-auto mb-4 object-contain bg-gray-50 rounded-lg" />
                <h3 className="font-bold text-lg mb-2 text-center">{product.name}</h3>
                <p className="text-sm text-gray-500 uppercase tracking-wide mb-2 text-center">{product.category}</p>
                <p className="text-2xl font-bold text-blue-600 text-center mb-4">K{product.price}</p>
                <div className="flex space-x-2">
                  <button onClick={() => handleEdit(product)} className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700">Edit</button>
                  <button onClick={() => handleDelete(product.id)} className="flex-1 bg-red-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-600">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Edit Form - shown when editing */}
        {editingId && (
          <div className="bg-white rounded-xl shadow-sm p-8 mt-8">
            <h3 className="text-xl font-bold mb-6">Edit Product</h3>
            <form onSubmit={handleUpdateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} placeholder="Name" className="p-3 border border-gray-300 rounded-lg" required />
              <input value={editForm.price} onChange={(e) => setEditForm({...editForm, price: e.target.value})} placeholder="Price (K)" className="p-3 border border-gray-300 rounded-lg" required />
              <input value={editForm.image} onChange={(e) => setEditForm({...editForm, image: e.target.value})} placeholder="Image URL" className="p-3 border border-gray-300 rounded-lg md:col-span-2" required />
              <select value={editForm.category} onChange={(e) => setEditForm({...editForm, category: e.target.value})} className="p-3 border border-gray-300 rounded-lg md:col-span-2" required>
                <option value="">Category</option>
                <option value="Gloseries">Gloseries</option>
                <option value="Electronic Gadgets">Electronic Gadgets</option>
                <option value="Software">Software</option>
                <option value="Storage">Storage</option>
              </select>
              <div className="md:col-span-2 flex space-x-3">
                <button type="submit" className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700">Update</button>
                <button type="button" onClick={() => {setEditingId(null); setEditForm({});}} className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600">Cancel</button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );

  if (view === 'customer') return <CustomerView />;
  if (view === 'login') return <LoginForm />;
  return <AdminDashboard />;
}
