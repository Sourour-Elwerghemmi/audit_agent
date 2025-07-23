export default function ReportsList() {
  const reports = [
    { name: 'Q3 Financial Report', date: '2023-09-30' },
    { name: 'Annual Compliance Audit', date: '2023-12-15' },
    { name: 'Risk Assessment Summary', date: '2023-11-01' },
    { name: 'HR Policy Review', date: '2023-08-20' },
    { name: 'IT Security Audit', date: '2023-10-05' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
        <h1 className="text-2xl font-bold text-orange-500 mb-6">AuditFlow</h1>
        
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search reports..."
            className="px-4 py-2 border border-gray-200 rounded-lg w-full max-w-md"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Generated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((report, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">{report.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{report.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <button className="text-orange-600 hover:text-orange-800">View</button>
                    <button className="text-orange-600 hover:text-orange-800">Download</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-6">
          <button className="text-gray-600 hover:text-orange-500">Previous</button>
          <div className="flex space-x-2">
            <button className="px-3 py-1 bg-orange-500 text-white rounded">1</button>
            <button className="px-3 py-1 text-gray-600 hover:text-orange-500">2</button>
            <button className="px-3 py-1 text-gray-600 hover:text-orange-500">3</button>
          </div>
          <button className="text-gray-600 hover:text-orange-500">Next</button>
        </div>
      </div>
    </div>
  );
}
