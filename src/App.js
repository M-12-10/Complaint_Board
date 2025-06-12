import React, { useState, useEffect } from 'react';
import { Heart, Plus, X, Check, Clock, AlertCircle, Smile } from 'lucide-react';

const App = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [newComplaint, setNewComplaint] = useState({
    title: '',
    description: '',
    priority: 'low',
    submittedBy: 'Wife'
  });

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await fetch('/Complaint_Board/complaints.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setComplaints(data.complaints || []);
      } catch (e) {
        setError('Failed to load complaints. Using fresh board.');
        console.error("Fetch error:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const priorityColors = {
    low: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-red-100 text-red-800 border-red-200'
  };

  const priorityIcons = {
    low: <Smile className="w-4 h-4" />,
    medium: <Clock className="w-4 h-4" />,
    high: <AlertCircle className="w-4 h-4" />
  };

  const saveComplaints = (updatedComplaints) => {
    const dataToSave = {
      complaints: updatedComplaints,
      lastUpdated: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'complaints.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = () => {
    if (!newComplaint.title.trim()) return;

    const complaint = {
      id: Date.now(),
      ...newComplaint,
      status: 'open',
      dateSubmitted: new Date().toISOString().split('T')[0]
    };

    const updatedComplaints = [complaint, ...complaints];
    setComplaints(updatedComplaints);
    saveComplaints(updatedComplaints);
    setNewComplaint({ title: '', description: '', priority: 'low', submittedBy: 'Wife' });
    setShowForm(false);
  };

  const toggleStatus = (id) => {
    const updatedComplaints = complaints.map(complaint =>
      complaint.id === id
        ? { ...complaint, status: complaint.status === 'open' ? 'resolved' : 'open' }
        : complaint
    );
    setComplaints(updatedComplaints);
    saveComplaints(updatedComplaints);
  };

  const deleteComplaint = (id) => {
    const updatedComplaints = complaints.filter(complaint => complaint.id !== id);
    setComplaints(updatedComplaints);
    saveComplaints(updatedComplaints);
  };


  const openComplaints = complaints.filter(c => c.status === 'open');
  const resolvedComplaints = complaints.filter(c => c.status === 'resolved');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-12 h-12 animate-pulse text-pink-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-8 h-8 text-pink-500" />
            <h1 className="text-4xl font-bold text-gray-800">Complaint Board</h1>
            <Heart className="w-8 h-8 text-pink-500" />
          </div>
          <p className="text-gray-600 text-lg">Apne bongu ko seedha kardo</p>
        </div>

        {/* Add New Complaint Button */}
        <div className="text-center mb-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-full flex items-center gap-2 mx-auto transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            File a New Complaint
          </button>
        </div>

        {/* New Complaint Form */}
        {showForm && (
          <div className="bg-white rounded-xl p-6 shadow-xl mb-8 border-2 border-pink-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Meri Jaan ko kia cheez tang karrhi?</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Complaint Title</label>
                <input
                  type="text"
                  value={newComplaint.title}
                  onChange={(e) => setNewComplaint({ ...newComplaint, title: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="e.g., Again ghalti se sogaya"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To Do</label>
                <textarea
                  value={newComplaint.description}
                  onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent h-24"
                  placeholder="e.g., Nahi sona again aise beghair bataye bonge admi"
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level</label>
                  <select
                    value={newComplaint.priority}
                    onChange={(e) => setNewComplaint({ ...newComplaint, priority: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="low">Low (Apne time pe theek karo)</option>
                    <option value="medium">Medium (Jaldi kar bongu)</option>
                    <option value="high">High (Foran se pehle bonge insaan)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-lg transition-colors"
                >
                  Submit Complaint
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Complaints Sections */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Open Complaints */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-orange-500" />
              Open Issues ({openComplaints.length})
            </h2>
            <div className="space-y-4">
              {openComplaints.map((complaint) => (
                <div key={complaint.id} className="bg-white rounded-xl p-5 shadow-lg border-l-4 border-orange-400">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">{complaint.title}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleStatus(complaint.id)}
                        className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors"
                        title="Mark as Resolved"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteComplaint(complaint.id)}
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                        title="Delete Complaint"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-3">{complaint.description}</p>

                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1 ${priorityColors[complaint.priority]}`}>
                        {priorityIcons[complaint.priority]}
                        {complaint.priority.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-gray-500">
                      {complaint.dateSubmitted}
                    </div>
                  </div>
                </div>
              ))}
              {openComplaints.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Heart className="w-12 h-12 mx-auto mb-3 text-pink-400" />
                  <p>No open complaints! You two are doing great! 💕</p>
                </div>
              )}
            </div>
          </div>

          {/* Resolved Complaints */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Check className="w-6 h-6 text-green-500" />
              Resolved Issues ({resolvedComplaints.length})
            </h2>
            <div className="space-y-4">
              {resolvedComplaints.map((complaint) => (
                <div key={complaint.id} className="bg-white rounded-xl p-5 shadow-lg border-l-4 border-green-400 opacity-75">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 line-through">{complaint.title}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleStatus(complaint.id)}
                        className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg transition-colors"
                        title="Reopen"
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteComplaint(complaint.id)}
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                        title="Delete Complaint"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-3">{complaint.description}</p>

                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full border text-xs font-medium bg-green-100 text-green-800 border-green-200">
                        ✅ RESOLVED
                      </span>
                    </div>
                    <div className="text-gray-500">
                      {complaint.dateSubmitted}
                    </div>
                  </div>
                </div>
              ))}
              {resolvedComplaints.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Smile className="w-12 h-12 mx-auto mb-3 text-green-400" />
                  <p>No resolved complaints yet. Get to work! 😉</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 p-4 bg-white rounded-xl shadow-lg">
          <p className="text-gray-600">
            💕 Remember: This is all about love, communication, and a little bit of fun! 💕
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Note: When you add/edit complaints, a JSON file will download. Upload this file as 'complaints.json' to your GitHub repo to persist data.
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
