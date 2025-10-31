'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { Button } from '@/components/Button';
import { Shield, Plus, Edit, Trash2, X, Save, Loader2 } from 'lucide-react';
import { successToast, errorToast } from '@/lib/toast';

interface Policy {
  id: string;
  name: string;
  description?: string | null;
  category: string;
  rules: any;
  requirements: any;
  effectiveDate?: string | null;
  expiryDate?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'regulation',
    rules: JSON.stringify([], null, 2),
    requirements: JSON.stringify({ requiredDocuments: [] }, null, 2),
    effectiveDate: '',
    expiryDate: '',
    isActive: true,
  });

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/policies');
      if (!response.ok) throw new Error('Failed to load policies');
      const data = await response.json();
      setPolicies(data.policies || []);
    } catch (error) {
      console.error('Failed to load policies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let response;
      if (editingPolicy) {
        response = await fetch(`/api/policies/${editingPolicy.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            rules: JSON.parse(formData.rules),
            requirements: JSON.parse(formData.requirements),
          }),
        });
      } else {
        response = await fetch('/api/policies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            rules: JSON.parse(formData.rules),
            requirements: JSON.parse(formData.requirements),
          }),
        });
      }

      if (!response.ok) throw new Error('Failed to save policy');

      await loadPolicies();
      resetForm();
      successToast(editingPolicy ? 'Policy updated successfully' : 'Policy created successfully');
    } catch (error: any) {
      console.error('Failed to save policy:', error);
      errorToast(`Failed to save policy: ${error.message}`);
    }
  };

  const handleEdit = (policy: Policy) => {
    setEditingPolicy(policy);
    setFormData({
      name: policy.name,
      description: policy.description || '',
      category: policy.category,
      rules: JSON.stringify(policy.rules, null, 2),
      requirements: JSON.stringify(policy.requirements, null, 2),
      effectiveDate: policy.effectiveDate ? new Date(policy.effectiveDate).toISOString().split('T')[0] : '',
      expiryDate: policy.expiryDate ? new Date(policy.expiryDate).toISOString().split('T')[0] : '',
      isActive: policy.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this policy?')) return;

    try {
      const response = await fetch(`/api/policies/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete policy');

      await loadPolicies();
      successToast('Policy deleted successfully');
    } catch (error) {
      console.error('Failed to delete policy:', error);
      errorToast('Failed to delete policy');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'regulation',
      rules: JSON.stringify([], null, 2),
      requirements: JSON.stringify({ requiredDocuments: [] }, null, 2),
      effectiveDate: '',
      expiryDate: '',
      isActive: true,
    });
    setEditingPolicy(null);
    setShowForm(false);
  };

  const getRuleExample = () => {
    return JSON.stringify(
      [
        {
          id: 'rule-1',
          name: 'Document must contain signature',
          description: 'Check if document has a signature field',
          requirement: 'Document must be signed',
          checkType: 'text_match',
          pattern: 'signature|signatur|underskrift',
        },
        {
          id: 'rule-2',
          name: 'Document must have effective date',
          description: 'Check if document has an effective date',
          requirement: 'Effective date is required',
          checkType: 'date',
        },
      ],
      null,
      2
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="page-container py-8">
          <div className="animate-pulse text-gray-500 uppercase tracking-wide">Loading policies...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="page-container py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-black mb-2 tracking-tight">POLICIES</h1>
            <p className="text-gray-600 text-sm uppercase tracking-wide">Manage compliance policies and rules</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="rounded-2xl uppercase tracking-wide"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Policy
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="border-2 border-gray-200 bg-white mb-8 rounded-3xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl uppercase tracking-wide">
                  {editingPolicy ? 'Edit Policy' : 'Create New Policy'}
                </CardTitle>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold uppercase tracking-wide mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold uppercase tracking-wide mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold uppercase tracking-wide mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:border-black"
                  >
                    <option value="regulation">Regulation</option>
                    <option value="internal">Internal</option>
                    <option value="legal">Legal</option>
                    <option value="compliance">Compliance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold uppercase tracking-wide mb-2">
                    Rules (JSON) *
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, rules: getRuleExample() })}
                      className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                    >
                      Load Example
                    </button>
                  </label>
                  <textarea
                    value={formData.rules}
                    onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                    rows={10}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:border-black font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold uppercase tracking-wide mb-2">
                    Requirements (JSON) *
                  </label>
                  <textarea
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    rows={5}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:border-black font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Example: {JSON.stringify({ requiredDocuments: ['policy', 'regulation'] })}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold uppercase tracking-wide mb-2">
                      Effective Date
                    </label>
                    <input
                      type="date"
                      value={formData.effectiveDate}
                      onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold uppercase tracking-wide mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isActive" className="text-sm font-semibold uppercase tracking-wide">
                    Active
                  </label>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="rounded-2xl uppercase tracking-wide">
                    <Save className="w-4 h-4 mr-2" />
                    {editingPolicy ? 'Update' : 'Create'} Policy
                  </Button>
                  <Button type="button" onClick={resetForm} variant="outline" className="rounded-2xl uppercase tracking-wide">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Policies List */}
        <div>
          <h2 className="text-2xl font-bold mb-4 uppercase tracking-wide">All Policies</h2>
          {policies.length === 0 ? (
            <Card className="border-2 border-dashed border-gray-300 bg-white rounded-3xl">
              <CardContent className="text-center py-16">
                <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-bold text-black uppercase tracking-wide mb-2">No Policies</p>
                <p className="text-gray-600 text-sm uppercase tracking-wide">
                  Click "New Policy" to create your first policy
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {policies.map((policy) => (
                <Card key={policy.id} className="border-2 border-gray-200 bg-white hover:shadow-lg transition-all duration-200 rounded-3xl">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-black mb-1">
                          {policy.name}
                        </CardTitle>
                        {policy.description && (
                          <p className="text-sm text-gray-600 mt-1">{policy.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                            {policy.category}
                          </span>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            policy.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {policy.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {Array.isArray(policy.rules) ? `${policy.rules.length} rules` : '0 rules'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEdit(policy)}
                          variant="outline"
                          size="sm"
                          className="rounded-2xl"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(policy.id)}
                          variant="outline"
                          size="sm"
                          className="rounded-2xl text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {policy.effectiveDate && (
                      <p className="text-xs text-gray-500">
                        Effective: {new Date(policy.effectiveDate).toLocaleDateString('en-US')}
                        {policy.expiryDate && ` - Expires: ${new Date(policy.expiryDate).toLocaleDateString('en-US')}`}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

