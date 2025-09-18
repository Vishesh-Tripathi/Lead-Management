import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { toast } from 'react-toastify';
import { leadService } from '../services/leadService';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

const LeadsPage = () => {
  const navigate = useNavigate();
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // AG Grid column definitions
  const columnDefs = useMemo(() => [
    {
      headerName: 'Name',
      valueGetter: (params) => `${params.data.first_name} ${params.data.last_name}`,
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      field: 'email',
      headerName: 'Email',
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      field: 'phone',
      headerName: 'Phone',
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      field: 'company',
      headerName: 'Company',
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      field: 'city',
      headerName: 'City',
      sortable: true,
      filter: true,
      width: 120,
    },
    {
      field: 'state',
      headerName: 'State',
      sortable: true,
      filter: true,
      width: 120,
    },
    {
      field: 'source',
      headerName: 'Source',
      sortable: true,
      filter: true,
      width: 130,
      cellRenderer: (params) => {
        const sourceLabels = {
          website: 'Website',
          facebook_ads: 'Facebook Ads',
          google_ads: 'Google Ads',
          referral: 'Referral',
          events: 'Events',
          other: 'Other',
        };
        return sourceLabels[params.value] || params.value;
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params) => {
        const statusColors = {
          new: 'bg-blue-100 text-blue-800',
          contacted: 'bg-yellow-100 text-yellow-800',
          qualified: 'bg-green-100 text-green-800',
          lost: 'bg-red-100 text-red-800',
          won: 'bg-purple-100 text-purple-800',
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[params.value]}`}>
            {params.value.charAt(0).toUpperCase() + params.value.slice(1)}
          </span>
        );
      },
    },
    {
      field: 'score',
      headerName: 'Score',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 100,
    },
    {
      field: 'lead_value',
      headerName: 'Value',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 120,
      valueFormatter: (params) => {
        return params.value ? `$${params.value.toLocaleString()}` : '$0';
      },
    },
    {
      field: 'is_qualified',
      headerName: 'Qualified',
      sortable: true,
      filter: true,
      width: 100,
      cellRenderer: (params) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          params.value 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {params.value ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      field: 'created_at',
      headerName: 'Created',
      sortable: true,
      filter: 'agDateColumnFilter',
      width: 130,
      valueFormatter: (params) => {
        return new Date(params.value).toLocaleDateString();
      },
    },
    {
      headerName: 'Actions',
      width: 200,
      cellRenderer: (params) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleView(params.data._id)}
            className="text-green-600 hover:text-green-800 text-sm font-medium"
          >
            View
          </button>
          <button
            onClick={() => handleEdit(params.data._id)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(params.data._id)}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      ),
      pinned: 'right',
    },
  ], []);

  const defaultColDef = useMemo(() => ({
    resizable: true,
    sortable: true,
    filter: true,
  }), []);

  const fetchLeads = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const queryParams = {
        page: pagination.page,
        limit: pagination.limit,
        ...params,
      };
      
      const response = await leadService.getLeads(queryParams);
      console.log(response)
      setRowData(response.data);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleView = (id) => {
    navigate(`/leads/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/leads/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await leadService.deleteLead(id);
        toast.success('Lead deleted successfully');
        fetchLeads();
      } catch (error) {
        console.error('Error deleting lead:', error);
        toast.error('Failed to delete lead');
      }
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchLeads({ page: newPage, limit: pagination.limit });
  };

  const handlePageSizeChange = (newPageSize) => {
    setPagination(prev => ({ ...prev, limit: newPageSize, page: 1 }));
    fetchLeads({ page: 1, limit: newPageSize });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
        <div className="flex space-x-3">
          {/* <Link
            to="/leads/bulk-upload"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Bulk Upload
          </Link> */}
          <Link
            to="/leads/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Create Lead
          </Link>
        </div>
      </div>

      {/* Pagination Info */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <div>
          Showing {rowData.length} of {pagination.total} leads
        </div>
        <div className="flex items-center space-x-2">
          <span>Rows per page:</span>
          <select
            value={pagination.limit}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* AG Grid */}
      <div className="ag-theme-alpine" style={{ height: '600px', width: '100%' }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          loading={loading}
          suppressCellFocus={true}
          rowSelection="single"
          theme="legacy"
          onGridReady={(params) => {
            params.api.sizeColumnsToFit();
          }}
        />
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Page {pagination.page} of {pagination.totalPages}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          
          {/* Page numbers */}
          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
            const pageNum = Math.max(1, pagination.page - 2) + i;
            if (pageNum > pagination.totalPages) return null;
            
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-3 py-1 border rounded text-sm ${
                  pageNum === pagination.page
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadsPage;