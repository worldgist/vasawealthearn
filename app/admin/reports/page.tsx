export default function AdminReportsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Admin Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#c4d626] rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-[#0c3a30]">AD</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Admin Portal</h3>
                <p className="text-sm text-gray-500">System Administrator</p>
              </div>
            </div>
          </div>

          <nav className="mt-6">
            <div className="px-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">SYSTEM</p>
              <a
                href="/admin/reports"
                className="flex items-center px-3 py-2 text-sm font-medium text-white bg-[#c4d626] rounded-md mb-1"
              >
                <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                Reports & Analytics
              </a>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <header className="bg-white shadow-sm border-b">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                  <p className="text-sm text-gray-500">System performance and business intelligence</p>
                </div>
                <div className="flex space-x-3">
                  <button className="bg-[#c4d626] text-[#0c3a30] px-4 py-2 rounded-md font-medium hover:bg-[#a8b821] transition-colors">
                    Export All Reports
                  </button>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors">
                    Schedule Report
                  </button>
                </div>
              </div>
            </div>
          </header>

          <main className="p-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">$12.8M</p>
                    <p className="text-sm text-green-600">+15.3% from last month</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Active Users</p>
                    <p className="text-3xl font-bold text-gray-900">1,247</p>
                    <p className="text-sm text-blue-600">+8.2% growth rate</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">System Uptime</p>
                    <p className="text-3xl font-bold text-gray-900">99.9%</p>
                    <p className="text-sm text-green-600">Excellent performance</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Report Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Financial Reports</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Daily Transaction Summary</span>
                    <button className="text-[#c4d626] hover:text-[#a8b821] text-sm">Generate</button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Monthly Revenue Report</span>
                    <button className="text-[#c4d626] hover:text-[#a8b821] text-sm">Generate</button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Investment Performance</span>
                    <button className="text-[#c4d626] hover:text-[#a8b821] text-sm">Generate</button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Loan Portfolio Analysis</span>
                    <button className="text-[#c4d626] hover:text-[#a8b821] text-sm">Generate</button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Compliance Reports</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">AML Compliance Report</span>
                    <button className="text-[#c4d626] hover:text-[#a8b821] text-sm">Generate</button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">KYC Status Summary</span>
                    <button className="text-[#c4d626] hover:text-[#a8b821] text-sm">Generate</button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Suspicious Activity Report</span>
                    <button className="text-[#c4d626] hover:text-[#a8b821] text-sm">Generate</button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Regulatory Filing</span>
                    <button className="text-[#c4d626] hover:text-[#a8b821] text-sm">Generate</button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
