import React from 'react'
const tabs = ['Overview', 'Amenities', 'Policies', 'Location', 'Reviews'];
function productmenus(selectedTab) {
  return (
    <div>
            {/* Tabs navigation */}
            <div className="border-b border-border">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                selectedTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-muted-foreground hover:text-muted-foreground'
              }`}
              onClick={() => setSelectedTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default productmenus
