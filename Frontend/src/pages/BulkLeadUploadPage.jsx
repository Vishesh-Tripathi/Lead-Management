import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { leadService } from '../services/leadService';

const BulkLeadUploadPage = () => {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [jsonData, setJsonData] = useState('');
  const [uploadMethod, setUploadMethod] = useState('json'); // 'json' or 'csv'
  const [csvFile, setCsvFile] = useState(null);

  // Sample data for user reference
  const sampleData = [
    {
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@example.com",
      phone: "+1234567890",
      company: "Acme Corp",
      position: "Manager",
      address: "123 Main St",
      city: "New York",
      state: "NY",
      zip_code: "10001",
      country: "USA",
      source: "website",
      status: "new",
      lead_type: "cold",
      industry: "Technology",
      website: "www.acmecorp.com",
      score: 75,
      lead_value: 5000,
      is_qualified: false,
      notes: "Interested in our services"
    },
    {
      first_name: "Jane",
      last_name: "Smith",
      email: "jane.smith@example.com",
      phone: "+1987654321",
      company: "Tech Solutions",
      position: "Director",
      city: "San Francisco",
      state: "CA",
      source: "referral",
      status: "qualified",
      score: 90,
      lead_value: 10000,
      is_qualified: true
    }
  ];

  const handleJsonUpload = async () => {
    try {
      const leads = JSON.parse(jsonData);
      
      if (!Array.isArray(leads)) {
        toast.error('JSON data must be an array of lead objects');
        return;
      }

      if (leads.length === 0) {
        toast.error('Please provide at least one lead');
        return;
      }

      setUploading(true);
      const result = await leadService.bulkCreateLeads(leads);
      
      toast.success(result.message);
      
      // Show detailed results
      if (result.results.failed > 0) {
        if (result.results.duplicateEmails.length > 0) {
          toast.warn(`Duplicate emails found: ${result.results.duplicateEmails.join(', ')}`);
        }
      }
      
      // Navigate to leads page after successful upload
      navigate('/leads');
    } catch (error) {
      console.error('Error uploading leads:', error);
      if (error.name === 'SyntaxError') {
        toast.error('Invalid JSON format. Please check your data.');
      } else {
        const errorMessage = error.response?.data?.message || 'Failed to upload leads';
        toast.error(errorMessage);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile) {
      toast.error('Please select a CSV file');
      return;
    }

    try {
      setUploading(true);
      const fileContent = await readFileAsText(csvFile);
      const leads = parseCsvToJson(fileContent);
      
      if (leads.length === 0) {
        toast.error('No valid leads found in CSV file');
        return;
      }

      const result = await leadService.bulkCreateLeads(leads);
      
      toast.success(result.message);
      
      if (result.results.failed > 0) {
        if (result.results.duplicateEmails.length > 0) {
          toast.warn(`Duplicate emails found: ${result.results.duplicateEmails.join(', ')}`);
        }
      }
      
      navigate('/leads');
    } catch (error) {
      console.error('Error uploading CSV:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload CSV';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const parseCsvToJson = (csvContent) => {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const leads = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const lead = {};
      
      headers.forEach((header, index) => {
        const value = values[index] || '';
        
        // Convert specific fields to appropriate types
        if (header === 'score' || header === 'lead_value') {
          lead[header] = value ? parseFloat(value) : 0;
        } else if (header === 'is_qualified') {
          lead[header] = value.toLowerCase() === 'true' || value === '1';
        } else {
          lead[header] = value;
        }
      });

      // Only add leads with required fields
      if (lead.first_name && lead.email) {
        leads.push(lead);
      }
    }

    return leads;
  };

  const generateSampleCsv = () => {
    const headers = Object.keys(sampleData[0]);
    const csvContent = [
      headers.join(','),
      ...sampleData.map(lead => 
        headers.map(header => `"${lead[header] || ''}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_leads.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bulk Lead Upload</h1>
        <p className="text-gray-600">Upload multiple leads at once using JSON or CSV format.</p>
      </div>

      {/* Upload Method Selection */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Method</h2>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="json"
              checked={uploadMethod === 'json'}
              onChange={(e) => setUploadMethod(e.target.value)}
              className="mr-2"
            />
            <span>JSON Format</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="csv"
              checked={uploadMethod === 'csv'}
              onChange={(e) => setUploadMethod(e.target.value)}
              className="mr-2"
            />
            <span>CSV File</span>
          </label>
        </div>
      </div>

      {uploadMethod === 'json' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">JSON Data</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paste your JSON data here:
              </label>
              <textarea
                value={jsonData}
                onChange={(e) => setJsonData(e.target.value)}
                className="w-full h-64 p-3 border border-gray-300 rounded-md font-mono text-sm"
                placeholder={`[\n  {\n    "first_name": "John",\n    "last_name": "Doe",\n    "email": "john@example.com",\n    "phone": "+1234567890",\n    "company": "Acme Corp"\n  }\n]`}
              />
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setJsonData(JSON.stringify(sampleData, null, 2))}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Load Sample Data
              </button>
              <button
                onClick={handleJsonUpload}
                disabled={uploading || !jsonData.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md text-sm font-medium"
              >
                {uploading ? 'Uploading...' : 'Upload JSON Data'}
              </button>
            </div>
          </div>
        </div>
      )}

      {uploadMethod === 'csv' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">CSV File Upload</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select CSV file:
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files[0])}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <div className="flex justify-between">
              <button
                onClick={generateSampleCsv}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Download Sample CSV
              </button>
              <button
                onClick={handleCsvUpload}
                disabled={uploading || !csvFile}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md text-sm font-medium"
              >
                {uploading ? 'Uploading...' : 'Upload CSV File'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Field Reference */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Field Reference</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Required Fields:</h3>
            <ul className="text-gray-600 space-y-1">
              <li>• first_name (string)</li>
              <li>• email (string, unique)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Optional Fields:</h3>
            <ul className="text-gray-600 space-y-1">
              <li>• last_name (string)</li>
              <li>• phone (string)</li>
              <li>• company (string)</li>
              <li>• position (string)</li>
              <li>• address (string)</li>
              <li>• city (string)</li>
              <li>• state (string)</li>
              <li>• zip_code (string)</li>
              <li>• country (string)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Special Fields:</h3>
            <ul className="text-gray-600 space-y-1">
              <li>• source: website, facebook_ads, google_ads, referral, events, other</li>
              <li>• status: new, contacted, qualified, lost, won</li>
              <li>• score (number, 0-100)</li>
              <li>• lead_value (number)</li>
              <li>• is_qualified (boolean)</li>
              <li>• notes (string)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-yellow-800 mb-2">Important Notes:</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Maximum 1000 leads per upload</li>
          <li>• Duplicate emails will be skipped</li>
          <li>• Invalid entries will be reported but won't stop the upload</li>
          <li>• Required fields: first_name and email</li>
        </ul>
      </div>
    </div>
  );
};

export default BulkLeadUploadPage;