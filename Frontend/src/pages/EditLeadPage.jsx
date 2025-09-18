import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import LeadForm from '../components/LeadForm';
import { leadService } from '../services/leadService';

const EditLeadPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const response = await leadService.getLeadById(id);
        // Format date for datetime-local input
        const leadData = {
          ...response.lead,
          last_activity_at: response.lead.last_activity_at
            ? new Date(response.lead.last_activity_at).toISOString().slice(0, 16)
            : '',
        };
        setLead(leadData);
      } catch (error) {
        console.error('Error fetching lead:', error);
        toast.error('Failed to fetch lead details');
        navigate('/leads');
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [id, navigate]);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Convert empty strings to null for optional fields
      const formattedData = {
        ...data,
        last_activity_at: data.last_activity_at || null,
      };

      await leadService.updateLead(id, formattedData);
      toast.success('Lead updated successfully!');
      navigate('/leads');
    } catch (error) {
      console.error('Error updating lead:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update lead';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Lead not found</h2>
        <p className="text-gray-600 mt-2">The lead you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Lead</h1>
        <p className="text-gray-600">Update the information below to modify the lead.</p>
      </div>

      <LeadForm lead={lead} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
};

export default EditLeadPage;