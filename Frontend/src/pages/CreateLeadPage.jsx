import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import LeadForm from '../components/LeadForm';
import { leadService } from '../services/leadService';

const CreateLeadPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Convert empty strings to null for optional fields
      const formattedData = {
        ...data,
        last_activity_at: data.last_activity_at || null,
      };

      const response = await leadService.createLead(formattedData);
      toast.success('Lead created successfully!');
      // Redirect to the newly created lead's details page
      navigate(`/leads/${response.lead._id}`);
    } catch (error) {
      console.error('Error creating lead:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create lead';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Lead</h1>
        <p className="text-gray-600">Fill in the information below to create a new lead.</p>
      </div>

      <LeadForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
};

export default CreateLeadPage;