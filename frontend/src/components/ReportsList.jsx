import { useState } from 'react';

export default function ReportsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const reports = [
    { id: 1, name: 'Q3 Financial Report', date: '2023-09-30', status: 'Completed', type: 'Financial' },
    { id: 2, name: 'Annual Compliance Audit', date: '2023-12-15', status: 'In Progress', type: 'Compliance' },
    { id: 3, name: 'Risk Assessment Summary', date: '2023-11-01', status: 'Completed', type: 'Risk' },
    { id: 4, name: 'HR Policy Review', date: '2023-08-20', status: 'Completed', type: 'HR' },
    { id: 5, name: 'IT Security Audit', date: '2023-10-05', status: 'Under Review', type: 'Security' },
    { id: 6, name: 'Data Privacy Assessment', date: '2023-11-15', status: 'Completed', type: 'Privacy' },
  ];

  const filteredReports = reports.filter(report =>
    report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Under Review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      Financial: '💰',
      Compliance: '📋',
      Risk: '⚠️',
      HR: '👥',
      Security: '🔐',
      Privacy: '🛡️'
    };
    return icons[type] || '📄';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AuditFlow</h1>
              <p className="text-gray-600 mt-1">Gestion des rapports d'audit</p>
            </div>
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nouveau rapport
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Rechercher un rapport..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
              />
            </div>
            <div className="flex gap-3">
              <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                <option>Tous les types</option>
                <option>Financial</option>
                <option>Compliance</option>
                <option>Risk</option>
                <option>HR</option>
                <option>Security</option>
              </select>
              <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                <option>Tous les statuts</option>
                <option>Completed</option>
                <option>In Progress</option>
                <option>Under Review</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredReports.map((report) => (
            <div key={report.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{getTypeIcon(report.type)}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{report.name}</h3>
                    <p className="text-gray-500 text-sm">{report.type}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(report.status)}`}>
                  {report.status}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1V8a1 1 0 011-1h3z" />
                  </svg>
                  {report.date}
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-orange-50 text-orange-600 hover:bg-orange-100 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Voir
                </button>
                <button className="flex-1 bg-gray-50 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Télécharger
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Affichage de <span className="font-medium">1</span> à <span className="font-medium">{filteredReports.length}</span> sur <span className="font-medium">{reports.length}</span> rapports
            </div>
            
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 text-gray-600 hover:text-orange-600 disabled:text-gray-400 transition-colors" disabled>
                Précédent
              </button>
              
              <div className="flex gap-1">
                <button className="px-3 py-2 bg-orange-500 text-white rounded-lg font-medium">1</button>
                <button className="px-3 py-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">2</button>
                <button className="px-3 py-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">3</button>
              </div>
              
              <button className="px-4 py-2 text-gray-600 hover:text-orange-600 transition-colors">
                Suivant
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}