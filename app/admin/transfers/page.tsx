export default function AdminTransfersPage() {
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
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">TRANSACTIONS</p>
              <a
                href="/admin/transactions"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md mb-1"
              >
                <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                All Transactions
              </a>
              <a
                href="/admin/transfers"
                className="flex items-center px-3 py-2 text-sm font-medium text-white bg-[#c4d626] rounded-md mb-1"
              >
                <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                    clipRule="evenodd"
                  />
                </svg>
                Transfer Monitoring
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
                  <h1 className="text-2xl font-bold text-gray-900">Transfer Monitoring</h1>
                  <p className="text-sm text-gray-500">Monitor and approve high-value transfers</p>
                </div>
                <div className="flex space-x-3">
                  <button className="bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 transition-colors">
                    Approve All
                  </button>
                  <button className="bg-red-600 text-white px-4 py-2 rounded-md font-medium hover:bg-red-700 transition-colors">
                    Reject Selected
                  </button>
                </div>
              </div>
            </div>
          </header>

          <main className="p-6">
            {/* Transfer Details Card */}
            <div className="bg-white rounded-lg shadow mb-6 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Transfer Requiring Review</h3>
                <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">
                  High Priority
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Transfer Details</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Amount:</span>
                      <span className="text-sm font-bold text-gray-900">$102,364.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">From Account:</span>
                      <span className="text-sm text-gray-900">#9846850999</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">To Account:</span>
                      <span className="text-sm text-gray-900">4746802665</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Routing Number:</span>
                      <span className="text-sm text-gray-900">64007110</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Bank:</span>
                      <span className="text-sm text-gray-900">PNCBANK</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Description:</span>
                      <span className="text-sm text-gray-900">recovery funds for strange william booth</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">User Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Name:</span>
                      <span className="text-sm text-gray-900">Strange William Booth</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Email:</span>
                      <span className="text-sm text-gray-900">wbooth1945@gmail.com</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Phone:</span>
                      <span className="text-sm text-gray-900">+18176881062</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">KYC Status:</span>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Risk Level:</span>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        High
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex space-x-4">
                <button className="bg-green-600 text-white px-6 py-2 rounded-md font-medium hover:bg-green-700 transition-colors">
                  Approve Transfer
                </button>
                <button className="bg-red-600 text-white px-6 py-2 rounded-md font-medium hover:bg-red-700 transition-colors">
                  Reject Transfer
                </button>
                <button className="bg-gray-600 text-white px-6 py-2 rounded-md font-medium hover:bg-gray-700 transition-colors">
                  Request More Info
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
