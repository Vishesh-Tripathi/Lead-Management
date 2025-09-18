import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { leadService } from '../services/leadService';

const LeadDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const response = await leadService.getLeadById(id);
        setLead(response.lead);
      } catch (error) {
        console.error('Error fetching lead:', error);
        toast.error('Failed to fetch lead details');
        navigate('/leads');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLead();
    }
  }, [id, navigate]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await leadService.deleteLead(id);
        toast.success('Lead deleted successfully');
        navigate('/leads');
      } catch (error) {
        console.error('Error deleting lead:', error);
        toast.error('Failed to delete lead');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Lead Not Found</h2>
        <p className="text-gray-600 mb-6">The lead you're looking for doesn't exist or you don't have permission to view it.</p>
        <Link
          to="/leads"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Back to Leads
        </Link>
      </div>
    );
  }

  const sourceLabels = {
    website: 'Website',
    facebook_ads: 'Facebook Ads',
    google_ads: 'Google Ads',
    referral: 'Referral',
    events: 'Events',
    other: 'Other',
  };

  const statusColors = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    qualified: 'bg-green-100 text-green-800',
    lost: 'bg-red-100 text-red-800',
    won: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <Link to="/leads" className="hover:text-blue-600">Leads</Link>
            <span>/</span>
            <span>{lead.first_name} {lead.last_name}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {lead.first_name} {lead.last_name}
          </h1>
          <p className="text-gray-600">{lead.email}</p>
        </div>
        <div className="flex space-x-3">
          <Link
            to={`/leads/edit/${lead._id}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Edit Lead
          </Link>
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Delete Lead
          </button>
        </div>
      </div>

      {/* Status and Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Status</div>
          <div className="mt-1">
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${statusColors[lead.status]}`}>
              {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
            </span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Score</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">{lead.score}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Lead Value</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">
            ${lead.lead_value ? lead.lead_value.toLocaleString() : '0'}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Qualified</div>
          <div className="mt-1">
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
              lead.is_qualified 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {lead.is_qualified ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="text-sm text-gray-900">{lead.first_name} {lead.last_name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="text-sm text-gray-900">
                <a href={`mailto:${lead.email}`} className="text-blue-600 hover:text-blue-800">
                  {lead.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="text-sm text-gray-900">
                <a href={`tel:${lead.phone}`} className="text-blue-600 hover:text-blue-800">
                  {lead.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Company</dt>
              <dd className="text-sm text-gray-900">{lead.company || 'Not specified'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Position</dt>
              <dd className="text-sm text-gray-900">{lead.position || 'Not specified'}</dd>
            </div>
          </dl>
        </div>

        {/* Location Information */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Address</dt>
              <dd className="text-sm text-gray-900">{lead.address || 'Not specified'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">City</dt>
              <dd className="text-sm text-gray-900">{lead.city || 'Not specified'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">State</dt>
              <dd className="text-sm text-gray-900">{lead.state || 'Not specified'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">ZIP Code</dt>
              <dd className="text-sm text-gray-900">{lead.zip_code || 'Not specified'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Country</dt>
              <dd className="text-sm text-gray-900">{lead.country || 'Not specified'}</dd>
            </div>
          </dl>
        </div>

        {/* Lead Information */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Lead Information</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Source</dt>
              <dd className="text-sm text-gray-900">{sourceLabels[lead.source] || lead.source}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Lead Type</dt>
              <dd className="text-sm text-gray-900">{lead.lead_type || 'Not specified'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Industry</dt>
              <dd className="text-sm text-gray-900">{lead.industry || 'Not specified'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Website</dt>
              <dd className="text-sm text-gray-900">
                {lead.website ? (
                  <a 
                    href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {lead.website}
                  </a>
                ) : 'Not specified'}
              </dd>
            </div>
          </dl>
        </div>

        {/* Activity & Dates */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity & Dates</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="text-sm text-gray-900">
                {new Date(lead.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd className="text-sm text-gray-900">
                {new Date(lead.updated_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </dd>
            </div>
            {lead.last_activity_at && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Activity</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(lead.last_activity_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Notes */}
      {lead.notes && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{lead.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadDetailsPage;